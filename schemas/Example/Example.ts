/**
 * AUTO-GENERATED FILE - DO NOT EDIT.
 * This file was automatically generated.
 * Any changes made to this file will be overwritten.
 */

import Ajv from "https://esm.sh/ajv@8.12.0";
import addFormats from "https://esm.sh/ajv-formats@2.1.1";

export interface Example {
  randomNumber: 1 | 2 | 3;
  randomWord: "foo" | "bar" | "baz";
  word: string;
  number: number;
}
export interface ExampleCompressed {
  1: 0 | 1 | 2;
  2: 0 | 1 | 2;
  3: string;
  4: number;
}

export class ExampleUtil {
  private static ajv = (() => {
    const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
    addFormats(ajv);
    return ajv;
  })();

  static readonly RANDOMNUMBER_ENUM = [1, 2, 3] as const;
  static readonly RANDOMWORD_ENUM = ["foo", "bar", "baz"] as const;

  static readonly schema = Object.freeze(
    {
      "$id": "Example",
      "type": "object",
      "description": "A example schema with all allowed scenarios.",
      "properties": {
        "randomNumber": {
          "type": "number",
          "description": "A random number",
          "enum": [
            1,
            2,
            3,
          ],
          "default": 1,
        },
        "randomWord": {
          "type": "string",
          "description": "A random word",
          "enum": [
            "foo",
            "bar",
            "baz",
          ],
          "default": "foo",
        },
        "word": {
          "type": "string",
          "description": "A word",
          "default": "foo",
        },
        "number": {
          "type": "number",
          "description": "A number",
          "default": 0,
        },
      },
      "required": [
        "randomNumber",
      ],
    } as const,
  );
  static readonly compressedSchema = Object.freeze(
    {
      "$id": "ExampleCompressed",
      "type": "object",
      "description": "A example schema with all allowed scenarios.",
      "properties": {
        "1": {
          "type": "number",
          "description": "A random number Enum mapping: 0 = 1, 1 = 2, 2 = 3.",
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
            "A random word Enum mapping: 0 = foo, 1 = bar, 2 = baz.",
          "enum": [
            0,
            1,
            2,
          ],
          "default": 0,
        },
        "3": {
          "type": "string",
          "description": "A word",
          "default": "foo",
        },
        "4": {
          "type": "number",
          "description": "A number",
          "default": 0,
        },
      },
      "required": [
        "1",
      ],
      "additionalProperties": false,
    } as const,
  );
  static readonly schemaString =
    '{"$id":"Example","type":"object","description":"A example schema with all allowed scenarios.","properties":{"randomNumber":{"type":"number","description":"A random number","enum":[1,2,3],"default":1},"randomWord":{"type":"string","description":"A random word","enum":["foo","bar","baz"],"default":"foo"},"word":{"type":"string","description":"A word","default":"foo"},"number":{"type":"number","description":"A number","default":0}},"required":["randomNumber"]}' as const;
  static readonly compressedSchemaString =
    '{"$id":"ExampleCompressed","type":"object","description":"A example schema with all allowed scenarios.","properties":{"1":{"type":"number","description":"A random number Enum mapping: 0 = 1, 1 = 2, 2 = 3.","enum":[0,1,2],"default":1},"2":{"type":"number","description":"A random word Enum mapping: 0 = foo, 1 = bar, 2 = baz.","enum":[0,1,2],"default":0},"3":{"type":"string","description":"A word","default":"foo"},"4":{"type":"number","description":"A number","default":0}},"required":["1"],"additionalProperties":false}' as const;
  static validate = this.ajv.compile(this.schema);
  static validateCompressed = this.ajv.compile(this.compressedSchema);

  static decompress(compressedData: ExampleCompressed): Example {
    if (!this.validateCompressed(compressedData)) {
      throw new Error(
        "Validation failed: " +
          this.ajv.errorsText(this.validateCompressed.errors),
      );
    }

    return {
      randomNumber: this.RANDOMNUMBER_ENUM[compressedData["1"]],
      randomWord: this.RANDOMWORD_ENUM[compressedData["2"]],
      word: compressedData["3"],
      number: compressedData["4"],
    };
  }

  static compress(originalData: Example): ExampleCompressed {
    if (!this.validate(originalData)) {
      throw new Error(
        "Validation failed: " + this.ajv.errorsText(this.validate.errors),
      );
    }

    return {
      "1": this.RANDOMNUMBER_ENUM.indexOf(originalData.randomNumber) as
        | 0
        | 1
        | 2,
      "2": this.RANDOMWORD_ENUM.indexOf(originalData.randomWord) as 0 | 1 | 2,
      "3": originalData.word,
      "4": originalData.number,
    };
  }
}
