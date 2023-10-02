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
