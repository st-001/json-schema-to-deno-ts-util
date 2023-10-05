/**
 * AUTO-GENERATED FILE - DO NOT EDIT.
 * This file was automatically generated.
 * Any changes made to this file will be overwritten.
 */

import Ajv from "https://esm.sh/ajv@8.12.0";
import addFormats from "https://esm.sh/ajv-formats@2.1.1";

export interface PizzaOrderItem {
  size: "small" | "medium" | "large";
  sauce: "tomato" | "white" | "bbq";
  toppings: string[];
  quantity: number;
  instructions: string;
}
export interface PizzaOrderItemCompressed {
  1: 0 | 1 | 2;
  2: 0 | 1 | 2;
  3: string[];
  4: number;
  5: string;
}

export class PizzaOrderItemUtil {
  private static ajv = (() => {
    const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
    addFormats(ajv);
    return ajv;
  })();

  static readonly SIZE_ENUM = ["small", "medium", "large"] as const;
  static readonly SAUCE_ENUM = ["tomato", "white", "bbq"] as const;

  static readonly schema = Object.freeze(
    {
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
          "default": "",
        },
      },
      "required": [
        "size",
        "sauce",
        "toppings",
        "quantity",
        "instructions",
      ],
    } as const,
  );
  static readonly compressedSchema = Object.freeze(
    {
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
          "default": "",
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
    } as const,
  );
  static readonly schemaString =
    '{"$id":"PizzaOrderItem","type":"object","description":"A pizza order item.","properties":{"size":{"type":"string","description":"The size of the pizza.","enum":["small","medium","large"],"default":"medium"},"sauce":{"type":"string","description":"The type of sauce on the pizza.","enum":["tomato","white","bbq"],"default":"tomato"},"toppings":{"type":"array","description":"The list of toppings on the pizza.","items":{"type":"string"},"default":[]},"quantity":{"type":"number","description":"The quantity of the pizza.","default":1,"minimum":1},"instructions":{"type":"string","description":"Special instructions for the pizza.","default":""}},"required":["size","sauce","toppings","quantity","instructions"]}' as const;
  static readonly compressedSchemaString =
    '{"$id":"PizzaOrderItemCompressed","type":"object","description":"A pizza order item.","properties":{"1":{"type":"number","description":"The size of the pizza. Enum mapping: 0 = small, 1 = medium, 2 = large.","enum":[0,1,2],"default":1},"2":{"type":"number","description":"The type of sauce on the pizza. Enum mapping: 0 = tomato, 1 = white, 2 = bbq.","enum":[0,1,2],"default":0},"3":{"type":"array","description":"The list of toppings on the pizza.","items":{"type":"string"},"default":[]},"4":{"type":"number","description":"The quantity of the pizza.","default":1,"minimum":1},"5":{"type":"string","description":"Special instructions for the pizza.","default":""}},"required":["1","2","3","4","5"],"additionalProperties":false}' as const;
  static validate = this.ajv.compile(this.schema);
  static validateCompressed = this.ajv.compile(this.compressedSchema);

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

  static compress(originalData: PizzaOrderItem): PizzaOrderItemCompressed {
    if (!this.validate(originalData)) {
      throw new Error(
        "Validation failed: " + this.ajv.errorsText(this.validate.errors),
      );
    }

    return {
      "1": this.SIZE_ENUM.indexOf(originalData.size) as 0 | 1 | 2,
      "2": this.SAUCE_ENUM.indexOf(originalData.sauce) as 0 | 1 | 2,
      "3": originalData.toppings,
      "4": originalData.quantity,
      "5": originalData.instructions,
    };
  }
}
