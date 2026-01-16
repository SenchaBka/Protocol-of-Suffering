import { getAIresponse } from "./websocket/WebsocketConnection";

export async function processUserMessage(
  input: string,
  character: string = "DEFAULT"
): Promise<string> {
  try {
    return await getAIresponse(input, character);
  } catch (err: any) {
    throw new Error(err?.message || "Sorry, I couldn't process that. Please try again.");
  }
}

