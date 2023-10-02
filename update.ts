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

function compressSchema(schema: Schema): [Schema, MappingTable] {
  const compressedSchema: Schema = {
    $id: `${schema.$id}Compressed`,
    type: schema.type,
    description: schema.description,
    properties: {},
    required: [],
    additionalProperties: false, // Added this line to disallow additional properties
  };

  const mappingTable: MappingTable = {};

  let i = 1;
  for (const [key, prop] of Object.entries(schema.properties)) {
    const compressedProp: SchemaProperty = { ...prop };
    mappingTable[i.toString()] = { property: key };

    if (compressedProp.enum) {
      const enumMapping = compressedProp.enum.reduce((acc, val, index) => {
        acc[index] = val;
        return acc;
      }, {} as { [index: number]: string | number });

      mappingTable[i.toString()].enums = enumMapping;

      compressedProp.description =
        `${compressedProp.description} Enum mapping: ${
          Object.entries(enumMapping).map(([idx, val]) => `${idx} = ${val}`)
            .join(", ")
        }.`;

      if (compressedProp.type === "string") {
        compressedProp.type = "number";
        compressedProp.default = compressedProp.enum.indexOf(
          compressedProp.default as string,
        );
      }

      compressedProp.enum = compressedProp.enum.map((_, index) => index);
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
  let code = "";
  code += 'import Ajv from "https://esm.sh/ajv@8.12.0";\n';
  code += 'import addFormats from "https://esm.sh/ajv-formats@2.1.1";\n\n';

  code += "const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });\n";
  code += "addFormats(ajv);\n\n";

  code += `const compressedSchema = ${
    JSON.stringify(compressedSchema, null, 2)
  };\n\n`;
  code += "const validate = ajv.compile(compressedSchema);\n\n";

  let interfaces = "";
  interfaces += `interface ${originalSchema.$id} {\n`;
  for (const [key, prop] of Object.entries(originalSchema.properties)) {
    const type = prop.type === "array" ? `${prop.items!.type}[]` : prop.type;
    interfaces += `  ${key}: ${type};\n`;
  }
  interfaces += "}\n\n";

  interfaces += `interface ${compressedSchema.$id} {\n`;
  for (const key of Object.keys(compressedSchema.properties)) {
    interfaces += `  ${key}: any;\n`;
  }
  interfaces += "}\n\n";

  const functionBody = generateDecompressionFunction(
    originalSchema,
    mappingTable,
  );
  return `${code}${interfaces}${functionBody}`;
}

function generateDecompressionFunction(
  originalSchema: Schema,
  mappingTable: MappingTable,
): string {
  let functionBody =
    `function decompressData(compressedData: ${originalSchema.$id}Compressed): ${originalSchema.$id} {\n`;
  functionBody += `  if (!validate(compressedData)) {
    throw new Error('Validation failed: ' + ajv.errorsText(validate.errors));
  }\n\n  return {\n`;

  for (const [key, mapping] of Object.entries(mappingTable)) {
    const originalProp = originalSchema.properties[mapping.property];
    functionBody += `    ${mapping.property}: `;
    if (
      originalProp.type === "array" && originalProp.enum &&
      originalProp.items!.type === "number"
    ) {
      functionBody += `compressedData["${key}"],\n`;
    } else if (
      originalProp.type === "array" && originalProp.enum &&
      originalProp.items!.type === "string"
    ) {
      const enumMappings = originalProp.enum.map((val) => `"${val}"`).join(
        ", ",
      );
      functionBody +=
        `compressedData["${key}"].map((v: number) => [${enumMappings}][v]),\n`;
    } else if (mapping.enums) {
      const enumMappings = Object.entries(mapping.enums).map((
        [, val],
      ) => (typeof val === "number" ? val : `"${val}"`)).join(", ");
      functionBody += `[${enumMappings}][compressedData["${key}"]],\n`;
    } else {
      functionBody += `compressedData["${key}"],\n`;
    }
  }

  functionBody += "  };\n}";
  return functionBody;
}

const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
addFormats(ajv);
// users can only provide schemas that match this Meta-Schema.
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
const validateMeta = ajv.compile(metaSchema); // Compile the Meta-Schema

async function loadSchemaJson(schemaPath: string) {
  const schema = JSON.parse(await Deno.readTextFile(schemaPath)) as any;
  if (!validateMeta(schema)) { // Validate the user-provided schema against the Meta-Schema
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
    const generatedCode = generateCode(
      schema,
      compressedSchema,
      mappingTable,
    );

    // Write the generated code to a file or use it as needed
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

// Execute the processSchemaFiles function
await processSchemaFiles();
