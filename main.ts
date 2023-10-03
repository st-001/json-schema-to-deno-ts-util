import "https://deno.land/std@0.202.0/dotenv/load.ts";
import OpenAI from "npm:openai";
const openai = new OpenAI();
import { PizzaOrderItemUtil } from "./schemas/PizzaOrderItem/PizzaOrderItem.ts";

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

const systemPrompt = `
You task is to summarise the pizza order and output one one single line a JSON array containing with objects that must validate against this schema: ${
  JSON.stringify(PizzaOrderItemUtil.compressedSchema)
}
If the input is unrelated to pizza orders, return an empty array.
Your output must be a valid JSON array with no new lines and parseable by JSON.parse().
`;

export async function getPizzaOrderItemsCompressed(content: string) {
  const messages = [
    {
      role: "system",
      content: systemPrompt,
    },
    { role: "user", content },
  ] as Message[];

  const completion = await openai.chat.completions.create({
    messages: messages,
    model: "gpt-3.5-turbo-0613",
    max_tokens: 1000,
    temperature: 0,
  });

  const messageContent = completion.choices[0].message?.content;
  return messageContent;
}

const prompt =
  "2 large pepporoni pizzas with extra cheese. write funny note on box saying hi mom. then i want 1 cheese and";
const pizzaOrderItemsCompressedString = await getPizzaOrderItemsCompressed(
  prompt,
);

const pizzaOrderItemsCompressed = JSON.parse(
  pizzaOrderItemsCompressedString!,
);

console.log(pizzaOrderItemsCompressed);
