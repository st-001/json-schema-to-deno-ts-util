import Ajv from "https://esm.sh/ajv@8.12.0";
import addFormats from "https://esm.sh/ajv-formats@2.1.1";

export class PizzaOrderItemUtil {
  private static ajv = this.initializeAjv();
  static SIZE_ENUM = ["small", "medium", "large"] as const;
  static SAUCE_ENUM = ["tomato", "white", "bbq"] as const;

  public static readonly schema = {
    "$id": "PizzaOrderItem",
    "type": "object",
    "description": "A pizza order item.",
    "properties": {
      "size": {
        "type": "string",
        "description": "The size of the pizza.",
        "enum": [
          "small",
          "medium",
          "large",
        ],
        "default": "medium",
      },
      "sauce": {
        "type": "string",
        "description": "The type of sauce on the pizza.",
        "enum": [
          "tomato",
          "white",
          "bbq",
        ],
        "default": "tomato",
      },
      "toppings": {
        "type": "array",
        "description": "The list of toppings on the pizza.",
        "items": {
          "type": "string",
        },
        "default": [],
      },
      "quantity": {
        "type": "number",
        "description": "The quantity of the pizza.",
        "default": 1,
        "minimum": 1,
      },
      "instructions": {
        "type": "string",
        "description": "Special instructions for the pizza.",
        "default": null,
      },
    },
    "required": [
      "size",
      "sauce",
      "toppings",
      "quantity",
      "instructions",
    ],
  };

  public static readonly compressedSchema = {
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
        "description": "The quantity of the pizza.",
        "default": 1,
        "minimum": 1,
      },
      "5": {
        "type": "string",
        "description": "Special instructions for the pizza.",
        "default": null,
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

  private static validate = PizzaOrderItemUtil.ajv.compile(
    PizzaOrderItemUtil.schema,
  );
  private static validateCompressed = PizzaOrderItemUtil.ajv.compile(
    PizzaOrderItemUtil.compressedSchema,
  );

  static initializeAjv(): Ajv {
    const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
    addFormats(ajv);
    return ajv;
  }

  static decompress(compressedData: PizzaOrderItemCompressed): PizzaOrderItem {
    if (!this.validateCompressed(compressedData)) {
      throw new Error(
        "Validation failed: " +
          this.ajv.errorsText(this.validateCompressed.errors),
      );
    }

    return {
      size: this.SIZE_ENUM[compressedData["1"]],
      sauce: this.SAUCE_ENUM[compressedData["2"]],
      toppings: compressedData["3"],
      quantity: compressedData["4"],
      instructions: compressedData["5"],
    };
  }
}

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
