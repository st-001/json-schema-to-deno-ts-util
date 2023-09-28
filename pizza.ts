// Loads .env file
import "https://deno.land/std@0.202.0/dotenv/load.ts";
import OpenAI from "npm:openai";
const openai = new OpenAI();
import Ajv from "https://esm.sh/ajv@8.12.0";
import addFormats from "https://esm.sh/ajv-formats@2.1.1";

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

// Function to convert sauce key
export function convertSauce(sauce: string): "tomato" | "white" | "bbq" {
  switch (sauce) {
    case "t":
      return "tomato";
    case "w":
      return "white";
    case "b":
      return "bbq";
    default:
      throw new Error(`Invalid sauce: ${sauce}`);
  }
}

// Function to convert keys
function convertToPizzaOrderItem(content: string): PizzaOrderItem[] {
  const parsed = JSON.parse(content);

  // Map each item’s keys
  return parsed.map((item: PizzaOrderItemMinified) => ({
    size: convertSize(item.s),
    sauce: convertSauce(item.sa),
    toppings: item.t,
    quantity: item.q,
  }));
}

// Function to convert size key
export function convertSize(size: string): "small" | "medium" | "large" {
  switch (size) {
    case "s":
      return "small";
    case "m":
      return "medium";
    case "l":
      return "large";
    default:
      throw new Error(`Invalid size: ${size}`);
  }
}

export const pizzaOrderItemMinifiedSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  description:
    "A pizza order item. If the content is vague, the default values are used.",
  properties: {
    s: {
      type: "string",
      description: "The size of the pizza. s = small, m = medium, l = large.",
      enum: ["s", "m", "l"],
      default: "m",
    },
    sa: {
      type: "string",
      description:
        "The type of sauce on the pizza. t = tomato, w = white, b = bbq.",
      enum: ["t", "w", "b"],
      default: "t",
    },
    t: {
      type: "array",
      description:
        "The list of toppings on the pizza. Defaults to an empty array.",
      items: {
        type: "string",
      },
      default: [],
    },
    q: {
      type: "integer",
      description: "The quantity of the pizza.",
      default: 1,
      minimum: 1,
    },
  },
  required: ["s", "sa", "t", "q"],
};

export const pizzaOrderItemSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  description: "A pizza order item.",
  properties: {
    size: {
      type: "string",
      description:
        "The size of the pizza. Can be 'small', 'medium', or 'large'.",
      enum: ["small", "medium", "large"],
      default: "medium",
    },
    sauce: {
      type: "string",
      description:
        "The type of sauce on the pizza. Can be 'tomato', 'white', or 'bbq'.",
      enum: ["tomato", "white", "bbq"],
      default: "tomato",
    },
    toppings: {
      type: "array",
      description:
        "The list of toppings on the pizza. Defaults to an empty array.",
      items: {
        type: "string",
      },
      default: [],
    },
    quantity: {
      type: "integer",
      description: "The quantity of the pizza.",
      default: 1,
      minimum: 1,
    },
  },
  required: ["size", "sauce", "toppings", "quantity"],
};

// create a validator function from the schema
const validateMinifiedPizzaOrder = ajv.compile(pizzaOrderItemMinifiedSchema);

// create a validator function from the schema
const validatePizzaOrder = ajv.compile(pizzaOrderItemSchema);

export interface PizzaOrderItem {
  size: "small" | "medium" | "large";
  sauce: "tomato" | "white" | "bbq";
  toppings: string[];
  quantity: number;
}

export interface PizzaOrderItemMinified {
  s: "s" | "m" | "l";
  sa: "t" | "w" | "b";
  t: string[];
  q: number;
}

export const generatePizzaOrderSystemPrompt = `
Convert content you are provided into a JSON array containing objects which must validate against this schema:
${JSON.stringify(pizzaOrderItemMinifiedSchema, null, 2)}

The content provided may not specify the size, sauce, or toppings for the pizzas, so you will need to use the default values.

If the content is irrelevant to pizza, you should return an empty array.

Your output must be minified and compressed JSON parsable by JavaScript's JSON.parse() function.

The outputted JSON will be used to create a pizza order.
`;

export async function generatePizzaOrder(content: string) {
  const messages = [
    { role: "system", content: generatePizzaOrderSystemPrompt },
    { role: "user", content },
  ] as Message[];

  const completion = await openai.chat.completions.create({
    messages: messages,
    model: "gpt-4",
    max_tokens: 500,
    temperature: 0,
  });

  const messageContent = completion.choices[0].message?.content;

  if (!messageContent) throw new Error("No content received from OpenAI");

  const parsedContent: PizzaOrderItemMinified[] = JSON.parse(messageContent);

  if (parsedContent.length === 0) {
    throw new Error("No pizza order items could be found");
  }

  for (const item of parsedContent) {
    if (!validateMinifiedPizzaOrder(item)) {
      console.error(validateMinifiedPizzaOrder.errors);
      throw new Error("Schema validation failed for an item");
    }
  }

  const pizzaOrderItems = convertToPizzaOrderItem(messageContent);

  for (const item of pizzaOrderItems) {
    if (!validatePizzaOrder(item)) {
      console.error(validatePizzaOrder.errors);
      throw new Error("Schema validation failed for an item");
    }
  }

  return pizzaOrderItems;
}

const generatePizzaOrderSummarySystemPrompt = `
You will be provided with a JSON array of objects that represent a pizza order item. Here is the schema:
${JSON.stringify(pizzaOrderItemSchema, null, 2)}

For each object in the array, provide a short and direct sentence describing the pizza order item.
Be friendly and make a couple of comments about their pizza order in each sentence. Use some emojis.
If they use a funny/strange combination of toppings, make a joke about it.
`;

export async function generatePizzaOrderSummary(
  pizzaOrderItems: PizzaOrderItem[],
) {
  const messages = [
    { role: "system", content: generatePizzaOrderSummarySystemPrompt },
    { role: "user", content: JSON.stringify(pizzaOrderItems, null, 2) },
  ] as Message[];

  const completion = await openai.chat.completions.create({
    messages: messages,
    model: "gpt-3.5-turbo-16k-0613",
    max_tokens: 500,
    temperature: 1.2,
  });

  const messageContent = completion.choices[0].message?.content;

  return messageContent;
}
