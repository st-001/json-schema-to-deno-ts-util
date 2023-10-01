import Ajv from "https://esm.sh/ajv@8.12.0";
import addFormats from "https://esm.sh/ajv-formats@2.1.1";
export interface Customer {
  name: string;
  address: string;
  phone: string;
  email: string;
}
export const schema = {
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
  "required": ["name"],
};

export interface CustomerCompressed {
  "1": string;
  "2": string;
  "3": string;
  "4": string;
}
export const schemaCompressed = {
  "$id": "Customer",
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
  "required": ["1"],
};
export const propertyMappingTable: { [key: string]: number } = {
  "name": 1,
  "address": 2,
  "phone": 3,
  "email": 4,
};
export const enumMappingTables = {};
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
const validate = ajv.compile(schemaCompressed);
export function validateData(
  data: CustomerCompressed,
): { valid: boolean; errors: any } {
  const valid = validate(data);
  return {
    valid,
    errors: validate.errors,
  };
}

export function decompressData(compressedData: CustomerCompressed): Customer {
  const decompressedData: { [key: string]: any } = {};
  for (const compressedKey in compressedData) {
    const originalKey = Object.keys(propertyMappingTable).find(
      (key) => propertyMappingTable[key] === +compressedKey,
    );
    if (originalKey) {
      decompressedData[originalKey] = compressedData[compressedKey];
    }
  }
  return decompressedData as Customer;
}
