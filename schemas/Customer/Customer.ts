import Ajv from "https://esm.sh/ajv@8.12.0";
import addFormats from "https://esm.sh/ajv-formats@2.1.1";

function initializeAjv(): Ajv {
  const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
  addFormats(ajv);
  return ajv;
}
const ajv = initializeAjv();

const compressedSchema = {
  "$id": "CustomerCompressed",
  "type": "object",
  "description": "A customer.",
  "properties": {
    "1": {
      "type": "string",
      "description": "The name of the customer.",
      "default": "null",
    },
    "2": {
      "type": "string",
      "description": "The address of the customer.",
      "default": "null",
    },
    "3": {
      "type": "string",
      "description": "The phone number of the customer.",
      "default": "null",
    },
    "4": {
      "type": "string",
      "description": "The email address of the customer.",
      "default": "null",
    },
  },
  "required": [
    "1",
  ],
  "additionalProperties": false,
};

const validate = ajv.compile(compressedSchema);

interface Customer {
  name: string;
  address: string;
  phone: string;
  email: string;
}

interface CustomerCompressed {
  1: string;
  2: string;
  3: string;
  4: string;
}

export function decompressData(compressedData: CustomerCompressed): Customer {
  if (!validate(compressedData)) {
    throw new Error("Validation failed: " + ajv.errorsText(validate.errors));
  }

  return {
    name: compressedData["1"],
    address: compressedData["2"],
    phone: compressedData["3"],
    email: compressedData["4"],
  };
}
