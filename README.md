# Convert JSON Schemas to TypeScript utility classes for Deno 🦕

This is a tool that converts JSON schemas into TypeScript utility classes for
use in Deno.

It currently only supports a subset of JSON schema features. I'll eventually
expand it to support more features.

> 📝 **This is an experimental project that I made for my own use to compress
> JSON schemas and data for processing through large language models and to
> validate the output received and save on token cost. There are most likely
> bugs. Any feedback is much appreciated!**

## Features

- **Automatic Type Generation**: Typescript interfaces for the compressed and
  uncompressed versions of your data.
- **Compression & Decompression**: Compress and decompress your data.
- **Validation**: Built-in data validation using Ajv ensures your data adheres
  to the schema.
- **Reusability**: Once generated, the utility classes can be used in other Deno
  projects.

## Usage

- Ensure Deno is installed.
- Clone this repository.
- Create a folder in the schemas directory with the same name as the $id
  property of your schema.
- Add your schema to the folder. It must be called schema.json.
- Run:

```bash
deno task update
```

This will then generate/regenerate all the utility classes for your schemas.

## Example

### Input JSON schema

```json
{
  "$id": "PizzaOrderItem",
  "type": "object",
  "description": "A pizza order item.",
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
      "default": ""
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

### Generated TypeScript utility class

```typescript
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
```

## 🍕 Here are details about the generated `PizzaOrderItemUtil` class:

The `PizzaOrderItemUtil` class serves as a utility in TypeScript for managing
pizza orders in two formats: a standard representation and a compressed
representation.

## 📦 Imports

- The class imports **Ajv**, a popular JSON schema validator.
- Additionally, it imports `addFormats` to extend Ajv with additional format
  support.

## 📝 Interfaces

- **PizzaOrderItem**: Describes the structure of a standard pizza order with
  attributes like `size`, `sauce`, `toppings`, `quantity`, and `instructions`.
- **PizzaOrderItemCompressed**: A compact representation of `PizzaOrderItem`. It
  optimizes space by using numerical keys and represents attributes like `size`
  and `sauce` with numbers.

## 🛠 Utility Class Features

### Ajv Initialization

- Initializes the Ajv library with specific configurations for validation
  purposes.

### Constants

- `SIZE_ENUM` and `SAUCE_ENUM`: Enumerations that define the possible values for
  the size and sauce of the pizza.
- `schema` and `compressedSchema`: JSON schemas that define the expected
  structure for the standard and compressed data formats.
- `schemaString` and `compressedSchemaString`: Stringified representations of
  the above schemas.

### 🔄 Conversion Methods

- **decompress**: Converts a compressed pizza order into its standard format.
  Before decompressing, it ensures the compressed data is valid.
- **compress**: Converts a standard pizza order into its compressed format. It
  validates the original data before starting the compression.

### ✅ Validation Methods

- `validate` and `validateCompressed`: Functions generated by Ajv to validate
  objects against their respective schemas, ensuring data integrity and
  consistency.

## Here is an example of the 🍕 `PizzaOrderItemUtil` generated class in action:

```typescript
import {
  PizzaOrderItem,
  PizzaOrderItemCompressed,
  PizzaOrderItemUtil,
} from "./schemas/PizzaOrderItem/PizzaOrderItem.ts";

// Creating an original PizzaOrderItem
const originalOrder: PizzaOrderItem = {
  size: "large",
  sauce: "bbq",
  toppings: ["pepperoni", "mushrooms", "onions"],
  quantity: 2,
  instructions: "Extra crispy crust, please!",
};

// Printing the original order
console.log("Original Order:", originalOrder);

// Compressing the order
const compressedOrder: PizzaOrderItemCompressed = PizzaOrderItemUtil.compress(
  originalOrder,
);
console.log("Compressed Order:", compressedOrder);

// Decompressing the order back to its original form
const decompressedOrder: PizzaOrderItem = PizzaOrderItemUtil.decompress(
  compressedOrder,
);
console.log("Decompressed Order:", decompressedOrder);

// Validation of the original order
const isValidOriginal = PizzaOrderItemUtil.validate(originalOrder);
console.log("Is Original Order Valid?", isValidOriginal ? "Yes" : "No");

// Validation of the compressed order
const isValidCompressed = PizzaOrderItemUtil.validateCompressed(
  compressedOrder,
);
console.log("Is Compressed Order Valid?", isValidCompressed ? "Yes" : "No");

// Example of a compressed order
const predefinedCompressedOrder: PizzaOrderItemCompressed = {
  "1": 1,
  "2": 1,
  "3": ["olives", "spinach", "feta cheese"],
  "4": 1,
  "5": "Well done with extra cheese on top.",
};
console.log("Compressed:", predefinedCompressedOrder);

// Decompressing the predefined compressed order should output:
// {
//    "size": "medium",
//    "sauce": "white",
//    "toppings": ["olives", "spinach", "feta cheese"],
//    "quantity": 1,
//    "instructions": "Well done with extra cheese on top."
// }
const decompressedPredefinedOrder: PizzaOrderItem = PizzaOrderItemUtil
  .decompress(predefinedCompressedOrder);
console.log("Decompressed:", decompressedPredefinedOrder);

// Get original JSON schema string
const originalSchemaString = PizzaOrderItemUtil.schemaString;
console.log("Original Schema:", originalSchemaString);

// Get compressed JSON schema string
const compressedSchemaString = PizzaOrderItemUtil.compressedSchemaString;
console.log("Compressed Schema:", compressedSchemaString);
```

> 📝 **Note**: Your input schemas must validate against this meta JSON schema
> otherwise the tool will throw an error:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "MetaSchema",
  "description": "Meta-Schema for validating schemas",
  "type": "object",
  "properties": {
    "$id": {
      "type": "string"
    },
    "$schema": {
      "type": "string"
    },
    "type": {
      "type": "string",
      "enum": ["object"]
    },
    "description": {
      "type": "string"
    },
    "properties": {
      "type": "object",
      "patternProperties": {
        ".*": {
          "type": "object",
          "properties": {
            "type": {
              "type": "string",
              "enum": ["string", "number", "array"]
            },
            "description": {
              "type": "string"
            },
            "default": {
              "type": ["string", "number", "array"]
            },
            "enum": {
              "type": "array",
              "items": {
                "type": ["string", "number"]
              }
            },
            "minimum": {
              "type": "number"
            }
          },
          "required": ["type", "description", "default"],
          "additionalProperties": false
        }
      }
    },
    "required": {
      "type": "array",
      "items": {
        "type": "string"
      }
    }
  },
  "required": ["$id", "type", "description", "properties", "required"],
  "additionalProperties": false
}
```

## Feedback & Contributions

Feel free to open issues or pull requests if you have suggestions or find any
bugs. Any feedback is appreciated!

## License

This project is licensed under the MIT License.
