import OpenAI from "openai";
interface Convo {
  role: string;
  content: string;
}
const openai = new OpenAI();
export default async function handler(
  context: Convo[],
  input: string
): Promise<string> {
  const contextInput: any = context.map((c) => {
    return {
      role: c.role,
      content: [{ type: "text", content: c.content }],
    };
  });
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      ...contextInput,
      {
        role: "user",
        content: input,
      },
    ],
  });
  return completion.choices[0].message.content || "";
}
