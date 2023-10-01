import Ajv from "https://esm.sh/ajv@8.12.0";
import addFormats from "https://esm.sh/ajv-formats@2.1.1";
export interface PizzaOrderItem {
  size: "small" | "medium" | "large";
  sauce: "tomato" | "white" | "bbq";
  toppings: string[];
  quantity: number;
}
export const schema = {
  "$id": "PizzaOrderItem",
  "type": "object",
  "description": "A pizza order item.",
  "properties": {
    "size": {
      "type": "string",
      "description": "The size of the pizza.",
      "enum": ["small", "medium", "large"],
      "default": "medium",
    },
    "sauce": {
      "type": "string",
      "description": "The type of sauce on the pizza.",
      "enum": ["tomato", "white", "bbq"],
      "default": "tomato",
    },
    "toppings": {
      "type": "array",
      "description": "The list of toppings on the pizza.",
      "items": { "type": "string" },
      "default": [],
    },
    "quantity": {
      "type": "number",
      "description": "The quantity of the pizza.",
      "default": 1,
      "minimum": 1,
    },
  },
  "required": ["size", "sauce", "toppings", "quantity"],
};

export interface PizzaOrderItemCompressed {
  "1": 0 | 1 | 2;
  "2": 0 | 1 | 2;
  "3": string[];
  "4": number;
}
export const schemaCompressed = {
  "$id": "PizzaOrderItem",
  "type": "object",
  "description": "A pizza order item.",
  "properties": {
    "1": {
      "type": "number",
      "description":
        "The size of the pizza. Enum mapping: 0 = small, 1 = medium, 2 = large.",
      "enum": [0, 1, 2],
      "default": 1,
    },
    "2": {
      "type": "number",
      "description":
        "The type of sauce on the pizza. Enum mapping: 0 = tomato, 1 = white, 2 = bbq.",
      "enum": [0, 1, 2],
      "default": 0,
    },
    "3": {
      "type": "array",
      "description": "The list of toppings on the pizza.",
      "items": { "type": "string" },
      "default": [],
    },
    "4": {
      "type": "number",
      "description": "The quantity of the pizza.",
      "default": 1,
      "minimum": 1,
    },
  },
  "required": ["1", "2", "3", "4"],
};
export const propertyMappingTable: { [key: string]: number } = {
  "size": 1,
  "sauce": 2,
  "toppings": 3,
  "quantity": 4,
};
export const enumMappingTables = {
  "size": { "small": 0, "medium": 1, "large": 2 },
  "sauce": { "tomato": 0, "white": 1, "bbq": 2 },
};
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
const validate = ajv.compile(schemaCompressed);
export function validateData(
  data: PizzaOrderItemCompressed,
): { valid: boolean; errors: any } {
  const valid = validate(data);
  return {
    valid,
    errors: validate.errors,
  };
}

export function decompressData(
  compressedData: PizzaOrderItemCompressed,
): PizzaOrderItem {
  const decompressedData: { [key: string]: any } = {};
  for (const compressedKey in compressedData) {
    const originalKey = Object.keys(propertyMappingTable).find(
      (key) => propertyMappingTable[key] === +compressedKey,
    );
    if (originalKey) {
      decompressedData[originalKey] = compressedData[compressedKey];
    }
  }
  return decompressedData as PizzaOrderItem;
}
