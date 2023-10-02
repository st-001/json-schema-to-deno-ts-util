# Structured output from OpenAI LLMs using JSON Schema, Deno, and TypeScript

This is just for fun but I am sharing my findings here.... I haven't really
tested it too much

If you run this code you may incur high token costs as its just prototyping.

superhans after one of his 3 day benders had a crazy idea to order 1000 pizzas.
500 only with bbq sauce. 500 with x10 cheese. Jeremy wants 1 with 5 toppings of
pepperoni, sausage, bacon, ham, and chicken. Mark wants 1 with 3 toppings of
pepperoni, sausage, and bacon. Super hans called back to trick mark and advised
to add so many chillis to marks pizza, which they argued about, but mark
eventually agreed.

Lets see what fun we can have with this...

After a wild night out with Mark and Jeremy from Peep Show, Superhans came up
with a crazy idea, the sort one could only have after hours of madness and pure
genius. "Let's order 1000 pizzas! 🍕" he slurred with a big hilarious grin, his
ideas as outrageous as his personality.

Mark and Jeremy exchanged glances, shrugged, and decided to let Superhans have
his moment of fun. After all, they knew this would make an unforgettable story
to re-read again later.

So Superhans took the lead and did the honors, dialing the pizza place with
enthusiasm. "We'd like 500 pizzas only with copious amounts of BBQ sauce, so
much that it would seem like a BBQ party at a pig farm! 🐖💃", he blurted. The
pizza guy on the other end almost dropped his hot combo slice, but he managed a
hesitant "A-are you s-sure, sir?" Superhans laughed and confirmed their
ludicrous order.

Just when you thought it couldn't get any crazier, Superhans passed the mobile
to Jeremy. "I'll have one with an orchestra of meat – pepperoni, sausage, bacon,
ham, and chicken, 5 toppings on an ensemble of doughy goodness! 🍖🎶" he loudly
declared, adding his own pinch of insanity to the mix.

Mark, being the practical and mild-mannered one in the group, took the phone
next. He asked for a simple pizza: "One with 3 toppings: pepperoni, sausage, and
bacon," he said. However, Superhans had a devilishly spicy trick up his sleeve.
As soon as Mark handed him back the phone, he sneakily added a brutal amount of
chilies 🌶️ to Mark's pizza.

"I know you said no adventures tonight, but what’s a pizza without some fire!
🌶️🔥 How about we turn your pizza into a lava field, Mark!" he cackled. Mark
balked at first, trying to wrestle the phone back, but after an intense and
funny argument, he reluctantly agreed.

Oh what a night it turned out to be! Pizzas raining like meteors in a sci-fi
movie 🎥, cheesy hot BBQ sauce flowing like lava, and Mark's pizza turning into
a spice volcano! If pizzas could tell stories, what a tale this order would
unfold!

Is it sane? Absolutely not! But is it a hilarious pizza story for the ages?
Undoubtedly yes! 😂🍕🔥

Now onto how to get the PizzaOrderItem...

We start with a JSON schema that supports a limited specification

```json
{
  "$id": "PizzaOrderItem",
  "type": "object",
  "description": "You have requested data which matches this JSON schema. You will be provided with their response in the form of natural language (email, text message, chat bot, etc). You need to analyse it and then parse it into this schema. Your output needs to be a one line JSON schema array that contains objects which match this schema. Your output must be parsable and must validate against this schema. There can be multiple objects. If you are unable to parse the message, output an array containing an object with the default values.",
  "properties": {
    "size": {
      "type": "string",
      "description": "The size of the pizza.",
      "enum": ["small", "medium", "large"],
      "default": "medium"
    },
    "sauce": {
      "type": "string",
      "description": "The type of sauce on the pizza.",
      "enum": ["tomato", "white", "bbq"],
      "default": "tomato"
    },
    "toppings": {
      "type": "array",
      "description": "The list of toppings on the pizza.",
      "items": {
        "type": "string"
      },
      "default": []
    },
    "quantity": {
      "type": "number",
      "description": "The quantity of the pizza.",
      "default": 1,
      "minimum": 1
    },
    "instructions": {
      "type": "string",
      "description": "Special instructions for the pizza.",
      "default": "null"
    }
  },
  "required": [
    "size",
    "sauce",
    "toppings",
    "quantity",
    "instructions"
  ]
}
```

TypeScript code for JSON schemas provided get automatically generated

```typescript
import Ajv from "https://esm.sh/ajv@8.12.0";
import addFormats from "https://esm.sh/ajv-formats@2.1.1";

function initializeAjv(): Ajv {
  const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
  addFormats(ajv);
  return ajv;
}
const ajv = initializeAjv();

export const compressedSchema = {
  "$id": "PizzaOrderItemCompressed",
  "type": "object",
  "description":
    "You have requested data which matches this JSON schema. You will be provided with their response in the form of natural language (email, text message, chat bot, etc). You need to analyse it and then parse it into this schema. Your output needs to be a one line JSON schema array that contains objects which match this schema. Your output must be parsable and must validate against this schema. There can be multiple objects. If you are unable to parse the message, output an array containing an object with the default values.",
  "properties": {
    "1": {
      "type": "number",
      "description":
        "The size of the pizza. Enum mapping: 0 = small, 1 = medium, 2 = large.",
      "enum": [
        0,
        1,
        2,
      ],
      "default": 1,
    },
    "2": {
      "type": "number",
      "description":
        "The type of sauce on the pizza. Enum mapping: 0 = tomato, 1 = white, 2 = bbq.",
      "enum": [
        0,
        1,
        2,
      ],
      "default": 0,
    },
    "3": {
      "type": "array",
      "description": "The list of toppings on the pizza.",
      "items": {
        "type": "string",
      },
      "default": [],
    },
    "4": {
      "type": "number",
      "description": "The quantity of the pizza.",
      "default": 1,
      "minimum": 1,
    },
    "5": {
      "type": "string",
      "description": "Special instructions for the pizza.",
      "default": "null",
    },
  },
  "required": [
    "1",
    "2",
    "3",
    "4",
    "5",
  ],
  "additionalProperties": false,
};

const validate = ajv.compile(compressedSchema);

export interface PizzaOrderItem {
  size: string;
  sauce: string;
  toppings: string[];
  quantity: number;
  instructions: string;
}

export interface PizzaOrderItemCompressed {
  1: number;
  2: number;
  3: string[];
  4: number;
  5: string;
}

export function decompressData(
  compressedData: PizzaOrderItemCompressed,
): PizzaOrderItem {
  if (!validate(compressedData)) {
    throw new Error("Validation failed: " + ajv.errorsText(validate.errors));
  }

  return {
    size: ["small", "medium", "large"][compressedData["1"]],
    sauce: ["tomato", "white", "bbq"][compressedData["2"]],
    toppings: compressedData["3"],
    quantity: compressedData["4"],
    instructions: compressedData["5"],
  };
}
```

On the initial prompt, we send a request to GPT-4 with only the compressed JSON
schema in the system message.

input superhans after one of his 5 day benders had a crazy idea to order 1000
pizzas. 500 only with bbq sauce. 500 with x10 cheese. Jeremy wants 1 with 5
toppings of pepperoni, sausage, bacon, ham, and chicken. Mark wants 1 with 3
toppings of pepperoni, sausage, and bacon. Super hans called back to trick mark
and advised to add so many chillis to marks pizza, which they argued about, but
mark eventually agreed.

```typescript
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
```

output from GPT-4

```json
[
  { "1": 1, "2": 2, "3": [], "4": 500, "5": "null" },
  { "1": 1, "2": 0, "3": ["cheese"], "4": 500, "5": "null" },
  {
    "1": 1,
    "2": 0,
    "3": ["pepperoni", "sausage", "bacon", "ham", "chicken"],
    "4": 1,
    "5": "null"
  },
  {
    "1": 1,
    "2": 0,
    "3": ["pepperoni", "sausage", "bacon", "chilli"],
    "4": 1,
    "5": "null"
  }
]
```

The compressed JSON received is then validated in its compressed state and
decompressed if it validates

```typescript
export function decompressData(
  compressedData: PizzaOrderItemCompressed,
): PizzaOrderItem {
  if (!validate(compressedData)) {
    throw new Error("Validation failed: " + ajv.errorsText(validate.errors));
  }

  return {
    size: ["small", "medium", "large"][compressedData["1"]],
    sauce: ["tomato", "white", "bbq"][compressedData["2"]],
    toppings: compressedData["3"],
    quantity: compressedData["4"],
    instructions: compressedData["5"],
  };
}
```

output

```json
[
  {
    "size": "medium",
    "sauce": "bbq",
    "toppings": [],
    "quantity": 500,
    "instructions": "null"
  },
  {
    "size": "medium",
    "sauce": "tomato",
    "toppings": [
      "cheese"
    ],
    "quantity": 500,
    "instructions": "null"
  },
  {
    "size": "medium",
    "sauce": "tomato",
    "toppings": [
      "pepperoni",
      "sausage",
      "bacon",
      "ham",
      "chicken"
    ],
    "quantity": 1,
    "instructions": "null"
  },
  {
    "size": "medium",
    "sauce": "tomato",
    "toppings": [
      "pepperoni",
      "sausage",
      "bacon",
      "chilli"
    ],
    "quantity": 1,
    "instructions": "null"
  }
]
```

As we have already validated before decompressing, there is no requirement to
validate again.

With this structured validated output, you can now use it either programatically
or pass back into the AI to do something else (generating the story with context
about the order)

I've tested passing the compressed schema back into the system prompt and then
for further actions, passing the compressed JSON outputs, and it seems to work.
But again this is just for fun.

Examples of how the outputs could be used in the context of this pizza order:

- Send a static table to the user in the chat interface showing the order and
  asking them if its correct. If not, configure a chain/tool to correct the
  schema based on newer information.

- Prompt a user to select if the bot got it correct the first time based on the
  confirming the validated data if yes, then store these in something like
  https://deno.com/kv to use for fine-tuning the OpenAI models.
