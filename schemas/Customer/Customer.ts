import Ajv from "https://esm.sh/ajv@8.12.0";
import addFormats from "https://esm.sh/ajv-formats@2.1.1";

export class CustomerUtil {
  private static ajv = this.initializeAjv();

  public static readonly schema = {
    "$id": "Customer",
    "type": "object",
    "description": "A customer.",
    "properties": {
      "name": {
        "type": "string",
        "description": "The name of the customer.",
        "default": null,
      },
      "address": {
        "type": "string",
        "description": "The address of the customer.",
        "default": null,
      },
      "phone": {
        "type": "string",
        "description": "The phone number of the customer.",
        "default": null,
      },
      "email": {
        "type": "string",
        "description": "The email address of the customer.",
        "default": null,
      },
    },
    "required": [
      "name",
      "address",
      "phone",
      "email",
    ],
  };

  public static readonly compressedSchema = {
    "$id": "CustomerCompressed",
    "type": "object",
    "description": "A customer.",
    "properties": {
      "1": {
        "type": "string",
        "description": "The name of the customer.",
        "default": null,
      },
      "2": {
        "type": "string",
        "description": "The address of the customer.",
        "default": null,
      },
      "3": {
        "type": "string",
        "description": "The phone number of the customer.",
        "default": null,
      },
      "4": {
        "type": "string",
        "description": "The email address of the customer.",
        "default": null,
      },
    },
    "required": [
      "1",
      "2",
      "3",
      "4",
    ],
    "additionalProperties": false,
  };

  private static validate = CustomerUtil.ajv.compile(CustomerUtil.schema);
  private static validateCompressed = CustomerUtil.ajv.compile(
    CustomerUtil.compressedSchema,
  );

  static initializeAjv(): Ajv {
    const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
    addFormats(ajv);
    return ajv;
  }

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
