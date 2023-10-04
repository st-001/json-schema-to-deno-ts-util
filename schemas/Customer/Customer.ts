/**
 * AUTO-GENERATED FILE - DO NOT EDIT.
 * This file was automatically generated.
 * Any changes made to this file will be overwritten.
 */

import Ajv from "https://esm.sh/ajv@8.12.0";
import addFormats from "https://esm.sh/ajv-formats@2.1.1";
export interface Customer {
  name: string;
  address: string;
  phone: string;
  email: string;
}
export interface CustomerCompressed {
  1: string;
  2: string;
  3: string;
  4: string;
}
export class CustomerUtil {
  private static ajv = (() => {
    const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
    addFormats(ajv);
    return ajv;
  })();

  static readonly schema = Object.freeze(
    {
      "$id": "Customer",
      "type": "object",
      "description": "A customer.",
      "properties": {
        "name": {
          "type": "string",
          "description": "The name of the customer.",
          "default": "",
        },
        "address": {
          "type": "string",
          "description": "The address of the customer.",
          "default": "",
        },
        "phone": {
          "type": "string",
          "description": "The phone number of the customer.",
          "default": "",
        },
        "email": {
          "type": "string",
          "description": "The email address of the customer.",
          "default": "",
        },
      },
      "required": [
        "name",
        "address",
        "phone",
        "email",
      ],
    } as const,
  );

  static readonly compressedSchema = Object.freeze(
    {
      "$id": "CustomerCompressed",
      "type": "object",
      "description": "A customer.",
      "properties": {
        "1": {
          "type": "string",
          "description": "The name of the customer.",
          "default": "",
        },
        "2": {
          "type": "string",
          "description": "The address of the customer.",
          "default": "",
        },
        "3": {
          "type": "string",
          "description": "The phone number of the customer.",
          "default": "",
        },
        "4": {
          "type": "string",
          "description": "The email address of the customer.",
          "default": "",
        },
      },
      "required": [
        "1",
        "2",
        "3",
        "4",
      ],
      "additionalProperties": false,
    } as const,
  );

  static readonly schemaString =
    '{"$id":"Customer","type":"object","description":"A customer.","properties":{"name":{"type":"string","description":"The name of the customer.","default":""},"address":{"type":"string","description":"The address of the customer.","default":""},"phone":{"type":"string","description":"The phone number of the customer.","default":""},"email":{"type":"string","description":"The email address of the customer.","default":""}},"required":["name","address","phone","email"]}' as const;

  static readonly compressedSchemaString =
    '{"$id":"CustomerCompressed","type":"object","description":"A customer.","properties":{"1":{"type":"string","description":"The name of the customer.","default":""},"2":{"type":"string","description":"The address of the customer.","default":""},"3":{"type":"string","description":"The phone number of the customer.","default":""},"4":{"type":"string","description":"The email address of the customer.","default":""}},"required":["1","2","3","4"],"additionalProperties":false}' as const;

  static validate = this.ajv.compile(this.schema);
  static validateCompressed = this.ajv.compile(this.compressedSchema);

  static decompress(compressedData: CustomerCompressed): Customer {
    if (!this.validateCompressed(compressedData)) {
      throw new Error(
        "Validation failed: " +
          this.ajv.errorsText(this.validateCompressed.errors),
      );
    }

    return {
      name: compressedData["1"],
      address: compressedData["2"],
      phone: compressedData["3"],
      email: compressedData["4"],
    };
  }
}
