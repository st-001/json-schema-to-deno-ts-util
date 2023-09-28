# Structured output from OpenAI LLMs using JSON Schema, Deno, and TypeScript

I've been playing around with getting structured data from OpenAI chat completion endpoints.

I'm also really enjoying working in Deno with Visual Studio Code and TypeScript. I'll continue to use it for my projects going forward. I think its fantastic, coming from a Node.js background.

This code is experimental and not intended for production use. I'm uploading this to share my findings.

Run at your own risk.

I did start with the new fine-tuning feature, but found better results with a GPT-4 system prompt.
I am going to revisit fine-tuning in the future, because I lack some understand of the underlying mechanics.

It starts with the users input
```plaintext
Hey! I wanna order 100 pizzas. 

all of them should have cheese and ham, except for 2 which only should have cheese
```

We need to convert the input into a JSON array containing objects that match the following schema.
The objects will be minified to save on tokens
```typescript
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
```

The schema gets formatted into the system prompt
```typescript
export const generatePizzaOrderSystemPrompt = `
Convert content you are provided into a JSON array containing objects which must validate against this schema:
${JSON.stringify(pizzaOrderItemMinifiedSchema, null, 2)}

The content provided may not specify the size, sauce, or toppings for the pizzas, so you will need to use the default values.

If the content is irrelevant to pizza, you should return an empty array.

Your output must be minified and compressed JSON parsable by JavaScript's JSON.parse() function.

The outputted JSON will be used to create a pizza order.
`;
```

The system prompt and the users input are then sent to OpenAI's GPT-4 model
```typescript
const messages = [
  { role: "system", content: generatePizzaOrderSystemPrompt },
  { role: "user", "Hey! I wanna order 100 pizzas. all of them should have cheese and ham, except for 2 which only should have cheese" },
] as Message[];

const completion = await openai.chat.completions.create({
  messages: messages,
  model: "gpt-4",
  max_tokens: 500,
  temperature: 0,
});
```

The expected output is
```json
[{"s":"m","sa":"t","t":["cheese","ham"],"q":98},{"s":"m","sa":"t","t":["cheese"],"q":2}]
```

Which is then validated against the minified schema
```typescript
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
```

If it validates, we convert the object properties into the full schema
```typescript
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
```

The non-minified output is then validated and can be used for further processing either through business logic or another OpenAI API call for things such as validating toppings, cost, price, re-validation, human review, etc.
```json
[
  {
    "size": "medium",
    "sauce": "tomato",
    "toppings": [
      "cheese",
      "ham"
    ],
    "quantity": 98
  },
  {
    "size": "medium",
    "sauce": "tomato",
    "toppings": [
      "cheese"
    ],
    "quantity": 2
  }
]
```

The PizzaOrderItem array is then passed into a summary function
```typescript
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
```

Which returns the following (I set the temperature to 1.2 to get some unhinged results)
```plaintext
Wow, you really love cheese and ham on your medium tomato sauce pizza! 🍕🧀🍖 
With 98 of them, you must be having a pizza party! Enjoy the cheesy goodness! 🎉😄

Oh, and for your other order of a medium tomato sauce pizza with just cheese, I hope you enjoy the simple and classic combination! Sometimes less is more, right? 😄🍕🧀
```

Here are a few more examples:
Input
```plaintext
one small with bacon and eggs, and another large with cheese, fries, pasta
```

Structured validated output
```json
[
  {
    "size": "small",
    "sauce": "tomato",
    "toppings": [
      "bacon",
      "eggs"
    ],
    "quantity": 1
  },
  {
    "size": "large",
    "sauce": "tomato",
    "toppings": [
      "cheese",
      "fries",
      "pasta"
    ],
    "quantity": 1
  }
]
```

Summary
```plaintext
You ordered a small 🍕 pizza with tomato 🍅 sauce and topped with bacon 🥓 and eggs 🍳. Breakfast pizza, anyone? 😄

And for your large 🍕 pizza, you went all out with tomato 🍅 sauce and a unique combination of toppings: cheese 🧀, fries 🍟, and pasta 🍝. Your pizza is transforming into an entire meal! Enjoy! 🍕😋
```

Input
```plaintext
can I please order 5 pepperoni and ham. 3 large and 2 medium. On 1 of the medium pizzas, make it a bbq base and add pineapple
```

Structured validated output
```json
[
  {
    "size": "large",
    "sauce": "tomato",
    "toppings": [
      "pepperoni",
      "ham"
    ],
    "quantity": 3
  },
  {
    "size": "medium",
    "sauce": "bbq",
    "toppings": [
      "pepperoni",
      "ham",
      "pineapple"
    ],
    "quantity": 1
  },
  {
    "size": "medium",
    "sauce": "tomato",
    "toppings": [
      "pepperoni",
      "ham"
    ],
    "quantity": 1
  }
]
```

Summary
```plaintext
The first pizza order is a large pizza with tomato sauce, topped with pepperoni and ham. 🍕🍅 The customer must really love those toppings because they ordered three of these pizzas! 🙌

The second pizza order is a medium pizza with BBQ sauce, topped with pepperoni, ham, and pineapple. 🍕🍗🍍 Ah, the classic combination of sweet pineapple with savory ham, it's like a tropical party on a pizza! 🌴🎉

The third pizza order is a medium pizza with tomato sauce, topped with pepperoni and ham. 🍕🍅 Just one pizza this time but still with the classic and delicious combination of tasty toppings. Can't go wrong with that! 😋
```