// deno-lint-ignore-file no-explicit-any
import Ajv from "https://esm.sh/ajv@8.12.0";
import addFormats from "https://esm.sh/ajv-formats@2.1.1";

interface KeyValue {
  [key: string | number]: string | number;
}

const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
addFormats(ajv);
// users can only provide schemas that match this Meta-Schema.
const metaSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "description": "Meta-Schema for validating user-provided schemas",
  "type": "object",
  "properties": {
    "$id": {
      "type": "string",
    },
    "type": {
      "type": "string",
      "enum": ["object"],
    },
    "description": {
      "type": "string",
    },
    "properties": {
      "type": "object",
      "patternProperties": {
        ".*": {
          "type": "object",
          "properties": {
            "type": {
              "type": "string",
              "enum": ["string", "number", "array"],
            },
            "description": {
              "type": "string",
            },
            "default": {
              "type": ["string", "number", "array", "null"],
            },
            "enum": {
              "type": "array",
              "items": {
                "type": ["string", "number"],
              },
            },
            "items": {
              "type": "object",
              "properties": {
                "type": {
                  "type": "string",
                  "enum": ["string", "number"],
                },
              },
              "required": ["type"],
            },
            "minimum": {
              "type": "number",
            },
          },
          "required": ["type", "description", "default"],
          "additionalProperties": false,
        },
      },
    },
    "required": {
      "type": "array",
      "items": {
        "type": "string",
      },
    },
  },
  "required": ["$id", "type", "description", "properties", "required"],
  "additionalProperties": false,
};
const validateMeta = ajv.compile(metaSchema); // Compile the Meta-Schema

function generateEnumMappingTable(
  enumValues: string[],
): KeyValue {
  const mappingTable: KeyValue = {};
  enumValues.forEach((value, index) => {
    mappingTable[value] = index;
  });
  return mappingTable;
}

function generateMappingTables(
  schema: any,
): { [key: string]: KeyValue } {
  const mappingTables: { [key: string]: KeyValue } = {};
  for (const property in schema.properties) {
    if (schema.properties[property].enum) {
      mappingTables[property] = generateEnumMappingTable(
        schema.properties[property].enum,
      );
    }
  }
  return mappingTables;
}

function compressEnumValues(
  enumValues: (string | number)[],
  mappingTable: KeyValue,
): (string | number)[] {
  return enumValues.map((value) =>
    mappingTable[value] !== undefined ? mappingTable[value] : value
  );
}

function generateMappingTable(keys: string[]): KeyValue {
  const mappingTable: KeyValue = {};
  keys.forEach((key, index) => {
    mappingTable[key] = index + 1;
  });
  return mappingTable;
}

function compressSchemaKeys(
  schema: any,
  propertyMappingTable: KeyValue,
  enumMappingTables: { [key: string]: KeyValue },
): any {
  if (Array.isArray(schema)) return schema;
  if (typeof schema !== "object" || schema === null) return schema;

  const compressed: any = {};
  for (const key in schema) {
    if (key === "properties" && typeof schema[key] === "object") {
      compressed[key] = {};
      for (const propertyKey in schema[key]) {
        const shortKey = propertyMappingTable[propertyKey] || propertyKey;

        // Clone the property to avoid changing the original schema.
        const clonedProperty = { ...schema[key][propertyKey] };

        if (clonedProperty.enum && enumMappingTables[propertyKey]) {
          // If property has enum, then change its type to number in the compressed schema
          clonedProperty.type = "number";

          const enumMappingStr = clonedProperty.enum
            .map((value: string) =>
              `${enumMappingTables[propertyKey][value]} = ${value}`
            )
            .join(", ");
          const newDescription =
            `${clonedProperty.description} Enum mapping: ${enumMappingStr}.`;
          const compressedDefault = clonedProperty.default
            ? enumMappingTables[propertyKey][clonedProperty.default]
            : undefined;
          compressed[key][shortKey] = {
            ...clonedProperty,
            description: newDescription,
            enum: compressEnumValues(
              clonedProperty.enum,
              enumMappingTables[propertyKey],
            ),
            default: compressedDefault,
          };
        } else {
          compressed[key][shortKey] = compressSchemaKeys(
            clonedProperty,
            propertyMappingTable,
            enumMappingTables,
          );
        }
      }
    } else if (key === "required" && Array.isArray(schema[key])) {
      compressed[key] = schema[key].map((propertyKey: string) =>
        String(propertyMappingTable[propertyKey] || propertyKey)
      );
    } else {
      compressed[key] = compressSchemaKeys(
        schema[key],
        propertyMappingTable,
        enumMappingTables,
      );
    }
  }

  return compressed;
}

export function generateTSContent({
  schema,
  compressedSchema,
  propertyMappingTable,
  enumMappingTables,
  compressedInterfaceName,
  originalTSInterface,
  compressedTSInterface,
}: {
  schema: any;
  compressedSchema: any;
  propertyMappingTable: KeyValue;
  enumMappingTables: { [key: string]: KeyValue };
  interfaceName: string;
  compressedInterfaceName: string;
  originalTSInterface: string;
  compressedTSInterface: string;
}): string {
  // Function to decompress the JSON object
  const decompressFunction = `
export function decompressData(compressedData: ${compressedInterfaceName}): ${schema.$id} {
  const decompressedData: { [key: string]: any } = {};
  for (const compressedKey in compressedData) {
    const originalKey = Object.keys(propertyMappingTable).find(
      key => propertyMappingTable[key] === +compressedKey
    );
    if (originalKey) {
      decompressedData[originalKey] = compressedData[compressedKey];
    }
  }
  return decompressedData as ${schema.$id};
}
  `;

  return `import Ajv from "https://esm.sh/ajv@8.12.0";
import addFormats from "https://esm.sh/ajv-formats@2.1.1";
${originalTSInterface}
export const schema = ${JSON.stringify(schema)};

${compressedTSInterface}
export const schemaCompressed = ${JSON.stringify(compressedSchema)};
export const propertyMappingTable: { [key: string]: number } = ${
    JSON.stringify(propertyMappingTable)
  };
export const enumMappingTables = ${JSON.stringify(enumMappingTables)};
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
const validate = ajv.compile(schemaCompressed);
export function validateData(data: ${compressedInterfaceName}): { valid: boolean; errors: any } {
const valid = validate(data);
return {
valid,
errors: validate.errors,
};
}
${decompressFunction}
`;
}

function generateTSInterface(schema: any, name: string): string {
  let tsInterface = `export interface ${name} {`;
  for (const property in schema.properties) {
    let type = schema.properties[property].type;
    if (type === "array") {
      const itemsType = schema.properties[property].items.type;
      type = `${itemsType}[]`;
    } else if (schema.properties[property].enum) {
      type = schema.properties[property].enum.map((value: string) =>
        `"${value}"`
      ).join(" | ");
    }
    tsInterface += ` ${property}: ${type};`;
  }
  tsInterface += "}";
  return tsInterface;
}

function generateCompressedTSInterface(
  schema: any,
  propertyMappingTable: KeyValue,
  enumMappingTables: { [key: string]: KeyValue },
  name: string,
): string {
  let tsInterface = `export interface ${name} {`;
  for (const property in schema.properties) {
    const shortKey = propertyMappingTable[property] || property;
    let type = schema.properties[property].type;
    if (type === "array") {
      const itemsType = schema.properties[property].items.type;
      type = `${itemsType}[]`;
    } else if (schema.properties[property].enum) {
      type = schema.properties[property].enum.map((value: string | number) => {
        const enumMap = enumMappingTables[property];
        if (enumMap && enumMap[value] !== undefined) {
          return enumMap[value]; // return as number, not string
        }
        return `${value}`; // leave it as-is, but as string
      }).join(" | ");
    } else if (type === "number") {
      type = "number";
    }
    tsInterface += ` "${shortKey}": ${type};`; // Corrected the line here
  }
  tsInterface += "}";
  return tsInterface;
}

async function loadSchemaJson(schemaPath: string) {
  const schema = JSON.parse(await Deno.readTextFile(schemaPath)) as any;
  if (!validateMeta(schema)) { // Validate the user-provided schema against the Meta-Schema
    throw new Error(
      `Schema validation failed: ${JSON.stringify(validateMeta.errors)}`,
    );
  }
  return ajv.compile(schema).schema as any;
}

async function processSchemaFiles() {
  for await (const dirEntry of Deno.readDir("./schemas")) {
    const schema = await loadSchemaJson(
      `./schemas/${dirEntry.name}/schema.json`,
    );
    const propertyMappingTable = generateMappingTable(
      Object.keys(schema.properties),
    );

    const enumMappingTables = generateMappingTables(schema);

    const compressedSchema = compressSchemaKeys(
      schema,
      propertyMappingTable,
      generateMappingTables(schema),
    );

    const interfaceName = schema.$id;
    const compressedInterfaceName = `${interfaceName}Compressed`;
    const originalTSInterface = generateTSInterface(
      schema,
      interfaceName,
    );
    const compressedTSInterface = generateCompressedTSInterface(
      compressedSchema,
      propertyMappingTable,
      enumMappingTables,
      compressedInterfaceName,
    );

    // Call to generateTSContent function
    const tsContent = generateTSContent({
      schema,
      compressedSchema,
      propertyMappingTable,
      enumMappingTables: generateMappingTables(schema),
      interfaceName,
      compressedInterfaceName,
      originalTSInterface,
      compressedTSInterface,
    });

    const folderPath = `./schemas/${interfaceName}`;
    await Deno.mkdir(folderPath, { recursive: true });
    const filePath = `${folderPath}/${interfaceName}.ts`;
    await Deno.writeTextFile(filePath, tsContent);
  }

  // After the loop has finished processing all schema files, format them all at once
  const command = new Deno.Command("deno", {
    args: ["fmt", "./schemas"],
  });
  const child = command.spawn();
  await child.status;
}

await processSchemaFiles();
