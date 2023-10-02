import Ajv from "https://esm.sh/ajv@8.12.0";
import addFormats from "https://esm.sh/ajv-formats@2.1.1";

function initializeAjv(): Ajv {
  const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
  addFormats(ajv);
  return ajv;
}
const ajv = initializeAjv();

const compressedSchema = {
  "$id": "PizzaOrderItemCompressed",
  "type": "object",
  "description": "A pizza order item.",
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
      "description":
        "The region area number Enum mapping: 0 = 1, 1 = 2, 2 = 3.",
      "enum": [
        0,
        1,
        2,
      ],
      "default": 1,
    },
    "5": {
      "type": "number",
      "description": "The quantity of the pizza.",
      "default": 1,
      "minimum": 1,
    },
    "6": {
      "type": "string",
      "description": "Special instructions for the pizza.",
      "default": "null",
    },
    "7": {
      "type": "array",
      "description": "The list of discount codes to apply to the pizza.",
      "items": {
        "type": "number",
      },
      "default": [],
    },
  },
  "required": [
    "1",
    "2",
    "3",
    "5",
    "6",
    "7",
  ],
  "additionalProperties": false,
};

const validate = ajv.compile(compressedSchema);

interface PizzaOrderItem {
  size: string;
  sauce: string;
  toppings: string[];
  area: number;
  quantity: number;
  instructions: string;
  discountCodes: number[];
}

interface PizzaOrderItemCompressed {
  1: number;
  2: number;
  3: string[];
  4: number;
  5: number;
  6: string;
  7: number[];
}

function decompressData(
  compressedData: PizzaOrderItemCompressed,
): PizzaOrderItem {
  if (!validate(compressedData)) {
    throw new Error("Validation failed: " + ajv.errorsText(validate.errors));
  }

  return {
    size: ["small", "medium", "large"][compressedData["1"]],
    sauce: ["tomato", "white", "bbq"][compressedData["2"]],
    toppings: compressedData["3"],
    area: [1, 2, 3][compressedData["4"]],
    quantity: compressedData["5"],
    instructions: compressedData["6"],
    discountCodes: compressedData["7"],
  };
}
