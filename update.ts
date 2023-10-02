import Ajv from "https://esm.sh/ajv@8.12.0";
import addFormats from "https://esm.sh/ajv-formats@2.1.1";

interface Schema {
  $id: string;
  type: string;
  description: string;
  properties: Record<string, SchemaProperty>;
  required: string[];
  additionalProperties: false;
}

interface SchemaProperty {
  type: string;
  description: string;
  default: string | number | string[] | null;
  enum?: (string | number)[];
  items?: { type: string };
  minimum?: number;
}

interface MappingTable {
  [key: string]: {
    property: string;
    enums?: { [index: number]: string | number };
  };
}

const IMPORT_STATEMENTS = 'import Ajv from "https://esm.sh/ajv@8.12.0";\n' +
  'import addFormats from "https://esm.sh/ajv-formats@2.1.1";\n\n';

function initializeAjv(): Ajv {
  const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
  addFormats(ajv);
  return ajv;
}

function mapEnum(
  compressedProp: SchemaProperty,
): {
  enumMapping: Record<number, string | number>;
  modifiedProp: SchemaProperty;
} {
  const enumMapping = compressedProp.enum!.reduce((acc, val, index) => {
    acc[index] = val;
    return acc;
  }, {} as { [index: number]: string | number });

  compressedProp.description = `${compressedProp.description} Enum mapping: ${
    Object.entries(enumMapping).map(([idx, val]) => `${idx} = ${val}`).join(
      ", ",
    )
  }.`;

  if (compressedProp.type === "string") {
    compressedProp.type = "number";
    compressedProp.default = compressedProp.enum!.indexOf(
      compressedProp.default as string,
    );
  }

  compressedProp.enum = compressedProp.enum!.map((_, index) => index);

  return { enumMapping, modifiedProp: compressedProp };
}

function generateTypeDefinitions(
  schema: Schema,
  type: "original" | "compressed",
): string {
  let interfaces = `interface ${schema.$id} {\n`;
  for (const [key, prop] of Object.entries(schema.properties)) {
    const type = prop.type === "array" ? `${prop.items!.type}[]` : prop.type;
    interfaces += `  ${key}: ${type};\n`;
  }
  interfaces += "}\n\n";
  return interfaces;
}

function generateDecompressionLogic(
  originalProp: SchemaProperty,
  key: string,
  mapping: { property: string; enums?: { [index: number]: string | number } },
): string {
  let decompressionLogic = `    ${mapping.property}: `;
  if (
    originalProp.type === "array" && originalProp.enum &&
    originalProp.items!.type === "number"
  ) {
    decompressionLogic += `compressedData["${key}"],\n`;
  } else if (
    originalProp.type === "array" && originalProp.enum &&
    originalProp.items!.type === "string"
  ) {
    const enumMappings = originalProp.enum.map((val) => `"${val}"`).join(", ");
    decompressionLogic +=
      `compressedData["${key}"].map((v: number) => [${enumMappings}][v]),\n`;
  } else if (mapping.enums) {
    const enumMappings = Object.entries(mapping.enums).map((
      [, val],
    ) => (typeof val === "number" ? val : `"${val}"`)).join(", ");
    decompressionLogic += `[${enumMappings}][compressedData["${key}"]],\n`;
  } else {
    decompressionLogic += `compressedData["${key}"],\n`;
  }
  return decompressionLogic;
}

function compressSchema(schema: Schema): [Schema, MappingTable] {
  const compressedSchema: Schema = {
    $id: `${schema.$id}Compressed`,
    type: schema.type,
    description: schema.description,
    properties: {},
    required: [],
    additionalProperties: false,
  };
  const mappingTable: MappingTable = {};
  let i = 1;
  for (const [key, prop] of Object.entries(schema.properties)) {
    let compressedProp: SchemaProperty = { ...prop };
    mappingTable[i.toString()] = { property: key };
    if (compressedProp.enum) {
      const { enumMapping, modifiedProp } = mapEnum(compressedProp);
      mappingTable[i.toString()].enums = enumMapping;
      compressedProp = modifiedProp;
    }
    compressedSchema.properties[i.toString()] = compressedProp;
    if (schema.required.includes(key)) {
      compressedSchema.required.push(i.toString());
    }
    i++;
  }
  return [compressedSchema, mappingTable];
}

function generateCode(
  originalSchema: Schema,
  compressedSchema: Schema,
  mappingTable: MappingTable,
): string {
  let code = IMPORT_STATEMENTS;
  code += "const ajv = initializeAjv();\n\n";
  code += `const compressedSchema = ${
    JSON.stringify(compressedSchema, null, 2)
  };\n\n`;
  code += "const validate = ajv.compile(compressedSchema);\n\n";

  const interfaces = generateTypeDefinitions(originalSchema, "original") +
    generateTypeDefinitions(compressedSchema, "compressed");

  let functionBody =
    `function decompressData(compressedData: ${originalSchema.$id}Compressed): ${originalSchema.$id} {\n`;
  functionBody += `  if (!validate(compressedData)) {
    throw new Error('Validation failed: ' + ajv.errorsText(validate.errors));
  }\n\n  return {\n`;
  for (const [key, mapping] of Object.entries(mappingTable)) {
    const originalProp = originalSchema.properties[mapping.property];
    functionBody += generateDecompressionLogic(originalProp, key, mapping);
  }
  functionBody += "  };\n}";
  return `${code}${interfaces}${functionBody}`;
}

const ajv = initializeAjv();
const metaSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "MetaSchema",
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
const validateMeta = ajv.compile(metaSchema);

async function loadSchemaJson(schemaPath: string) {
  const schema = JSON.parse(await Deno.readTextFile(schemaPath)) as any;
  if (!validateMeta(schema)) {
    throw new Error(
      `Schema validation failed: ${JSON.stringify(validateMeta.errors)}`,
    );
  }
  return ajv.compile(schema).schema as Schema;
}

async function processSchemaFiles() {
  for await (const dirEntry of Deno.readDir("./schemas")) {
    const schema: Schema = await loadSchemaJson(
      `./schemas/${dirEntry.name}/schema.json`,
    );
    const [compressedSchema, mappingTable] = compressSchema(schema);
    const generatedCode = generateCode(schema, compressedSchema, mappingTable);
    await Deno.writeTextFile(
      `./schemas/${dirEntry.name}/${schema.$id}.ts`,
      generatedCode,
    );
  }
  const command = new Deno.Command("deno", {
    args: ["fmt", "./schemas"],
  });
  const child = command.spawn();
  await child.status;
}

await processSchemaFiles();
