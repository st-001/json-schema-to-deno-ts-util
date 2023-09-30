import Ajv from "https://esm.sh/ajv@8.12.0";
import addFormats from "https://esm.sh/ajv-formats@2.1.1";
export interface Customer {
  name: string;
  address: string;
  phone: string;
  email: string;
}
export interface CustomerCompressed {
  0: string;
  1: string;
  2: string;
  3: string;
}
export const schema = {
  "$id": "Customer",
  "type": "object",
  "description": "A customer.",
  "properties": {
    "name": { "type": "string", "description": "The name of the customer." },
    "address": {
      "type": "string",
      "description": "The address of the customer.",
    },
    "phone": {
      "type": "string",
      "description": "The phone number of the customer.",
    },
    "email": {
      "type": "string",
      "description": "The email address of the customer.",
    },
  },
};
export const schemaCompressed = {
  "$id": "Customer",
  "type": "object",
  "description": "A customer.",
  "properties": {
    "0": { "type": "string", "description": "The name of the customer." },
    "1": { "type": "string", "description": "The address of the customer." },
    "2": {
      "type": "string",
      "description": "The phone number of the customer.",
    },
    "3": {
      "type": "string",
      "description": "The email address of the customer.",
    },
  },
};
export const propertyMappingTable = {
  "name": "0",
  "address": "1",
  "phone": "2",
  "email": "3",
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
