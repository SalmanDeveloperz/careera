import { GoogleGenerativeAI } from "@google/generative-ai";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

function getGoogleClient() {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GOOGLE_API_KEY is not configured. Get a free API key from https://makersuite.google.com/app/apikey",
    );
  }
  return new GoogleGenerativeAI(apiKey);
}

/** Non-streaming completion. Returns the assistant text. */
export async function callAI(
  messages: ChatMessage[],
  opts: { model?: string; tools?: unknown; tool_choice?: unknown } = {},
): Promise<Response> {
  try {
    const client = getGoogleClient();
    const model = opts.model?.includes("gemini")
      ? opts.model
      : "gemini-1.5-flash";

    const chatSession = client.getGenerativeModel({ model });

    // Convert to Google's format
    const formattedMessages = messages.map((msg) => ({
      role: msg.role === "assistant" ? "model" : msg.role,
      parts: [{ text: msg.content }],
    }));

    const result = await chatSession.generateContent({
      contents: formattedMessages,
    });

    const text = result.response.text();

    return new Response(
      JSON.stringify({
        choices: [
          {
            message: {
              role: "assistant",
              content: text,
            },
          },
        ],
      }),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}

/** Streaming completion — returns the raw SSE Response body to forward to the client. */
export async function streamAI(
  messages: ChatMessage[],
  model?: string,
): Promise<Response> {
  try {
    const client = getGoogleClient();
    const modelName = model?.includes("gemini")
      ? model
      : "gemini-1.5-flash";

    const chatSession = client.getGenerativeModel({ model: modelName });

    // Convert to Google's format
    const formattedMessages = messages.map((msg) => ({
      role: msg.role === "assistant" ? "model" : msg.role,
      parts: [{ text: msg.content }],
    }));

    const stream = await chatSession.generateContentStream({
      contents: formattedMessages,
    });

    // Create a readable stream
    let buffer = "";
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream.stream) {
            const text = chunk.candidates?.[0]?.content?.parts?.[0]?.text || "";
            if (text) {
              buffer += text;
              // Send SSE formatted data
              controller.enqueue(
                new TextEncoder().encode(
                  `data: ${JSON.stringify({ choices: [{ delta: { content: text } }] })}\n\n`,
                ),
              );
            }
          }
          // Send final message
          controller.enqueue(
            new TextEncoder().encode(
              `data: ${JSON.stringify({ choices: [{ delta: { content: "" } }] })}\n\n`,
            ),
          );
          controller.close();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          controller.enqueue(
            new TextEncoder().encode(
              `data: ${JSON.stringify({ error: errorMessage })}\n\n`,
            ),
          );
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      `data: ${JSON.stringify({ error: errorMessage })}\n\n`,
      {
        status: 500,
        headers: { "Content-Type": "text/event-stream" },
      },
    );
  }
}
