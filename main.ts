import "https://deno.land/std@0.202.0/dotenv/load.ts";
import OpenAI from "npm:openai";
const openai = new OpenAI();

import {
  compressedSchema,
  decompressData,
  PizzaOrderItem,
  PizzaOrderItemCompressed,
} from "./schemas/PizzaOrderItem/PizzaOrderItem.ts";

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function getPizzaOrderItemsCompressed(content: string) {
  const messages = [
    { role: "system", content: JSON.stringify(compressedSchema) },
    { role: "user", content },
  ] as Message[];

  const completion = await openai.chat.completions.create({
    messages: messages,
    model: "gpt-4",
    max_tokens: 1000,
    temperature: 0,
  });

  console.log(completion.choices[0].message?.content);

  const messageContent = completion.choices[0].message?.content;

  return messageContent;
}

const prompt =
  "superhans has a crazy idea to order 1000 pizzas. 500 only with bbq sauce. 500 with x10 cheese. Jeremy wants 1 with 5 toppings of pepperoni, sausage, bacon, ham, and chicken. Mark wants 1 with 3 toppings of pepperoni, sausage, and bacon. Super hans called back to trick mark and advised to add so many chillis to marks pizza, which they argued about, but mark eventually agreed.";

const pizzaOrderItemsCompressedString = await getPizzaOrderItemsCompressed(
  prompt,
);

const pizzaOrderItemsCompressed: PizzaOrderItemCompressed[] = JSON.parse(
  pizzaOrderItemsCompressedString!,
);

const pizzaOrderItems: PizzaOrderItem[] = pizzaOrderItemsCompressed.map(
  decompressData,
);

console.log(JSON.stringify(pizzaOrderItems, null, 2));

const generatePizzaOrderSummarySystemPrompt = `
Generate a funny short story about Mark, Jeremy, and Superhans from Peep Show ordering Pizza after a night out.

You will be provided with the original order request we received and the pizza order we generated from it. You need to generate a funny story about the order. Use some emojis.
`;

const messages = [
  { role: "system", content: generatePizzaOrderSummarySystemPrompt },
  {
    role: "user",
    content: JSON.stringify(pizzaOrderItemsCompressed, null, 2),
  },
  {
    role: "assistant",
    content:
      "Thank you. Now pleae provide me with the original order request we received and I will generate a funny story about the order.",
  },
  {
    role: "user",
    content: prompt,
  },
] as Message[];

const completion = await openai.chat.completions.create({
  messages: messages,
  model: "gpt-4",
  max_tokens: 4000,
  temperature: 1,
});

console.log(completion.choices[0].message?.content);
