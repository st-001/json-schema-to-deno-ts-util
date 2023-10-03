import Ajv from "https://esm.sh/ajv@8.12.0";
import addFormats from "https://esm.sh/ajv-formats@2.1.1";
import metaSchema from "./metaSchema.json" assert { type: "json" };

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

function generateTypeDefinitions(schema: Schema): string {
  let interfaces = `export interface ${schema.$id} {\n`;
  for (const [key, prop] of Object.entries(schema.properties)) {
    const type = prop.type === "array" ? `${prop.items!.type}[]` : prop.type;
    interfaces += `  ${key}: ${type};\n`;
  }
  interfaces += "}\n\n";
  return interfaces;
}

function generateEnumConstants(schema: Schema): string {
  let enums = "";
  for (const [key, prop] of Object.entries(schema.properties)) {
    if (prop.enum) {
      const enumName = key.toUpperCase() + "_ENUM";
      enums += `  static ${enumName} = [${
        prop.enum.map((val) => (typeof val === "string" ? `"${val}"` : val))
          .join(", ")
      }];\n`;
    }
  }
  return enums;
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
    const enumConstantName = `this.${mapping.property.toUpperCase()}_ENUM`;
    decompressionLogic +=
      `compressedData["${key}"].map((v: number) => ${enumConstantName}[v]),\n`;
  } else if (mapping.enums) {
    const enumConstantName = `this.${mapping.property.toUpperCase()}_ENUM`;
    decompressionLogic += `${enumConstantName}[compressedData["${key}"]],\n`;
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
  let code = `import Ajv from "https://esm.sh/ajv@8.12.0";\n`;
  code += `import addFormats from "https://esm.sh/ajv-formats@2.1.1";\n\n`;

  const className = `${originalSchema.$id}Util`;

  // Start the class definition
  code += `class ${className} {\n`;

  // Add static ajv property
  code += `  private static ajv = this.initializeAjv();\n`;

  // Add enum constants
  code += generateEnumConstants(originalSchema) + "\n";

  // Add original and compressed schemas as static properties
  code += `  public static readonly schema = ${
    JSON.stringify(originalSchema, null, 2)
  };\n\n`;
  code += `  public static readonly compressedSchema = ${
    JSON.stringify(compressedSchema, null, 2)
  };\n\n`;

  // Add validateOriginal and validateCompressed as static properties
  code +=
    `  private static validate = ${className}.ajv.compile(${className}.schema);\n`;
  code +=
    `  private static validateCompressed = ${className}.ajv.compile(${className}.compressedSchema);\n\n`;

  // Add the initializeAjv function as a static method
  code += `  static initializeAjv(): Ajv {\n`;
  code +=
    `    const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });\n`;
  code += `    addFormats(ajv);\n`;
  code += `    return ajv;\n`;
  code += `  }\n\n`;

  // Add the decompressData function as a static method
  let functionBody =
    `  static decompress(compressedData: ${originalSchema.$id}Compressed): ${originalSchema.$id} {\n`;
  functionBody += `    if (!this.validateCompressed(compressedData)) {\n`;
  functionBody +=
    `      throw new Error("Validation failed: " + this.ajv.errorsText(this.validateCompressed.errors));\n`;
  functionBody += `    }\n\n    return {\n`;
  for (const [key, mapping] of Object.entries(mappingTable)) {
    const originalProp = originalSchema.properties[mapping.property];
    functionBody += generateDecompressionLogic(originalProp, key, mapping);
  }
  functionBody += "    };\n";
  functionBody += "  }\n";

  // Close the class definition
  code += functionBody;
  code += "}\n\n";

  const interfaces = generateTypeDefinitions(originalSchema) +
    generateTypeDefinitions(compressedSchema);

  // Export the class and interfaces
  code += interfaces;
  code += `export { ${className} };\n`;

  return code;
}

const ajv = initializeAjv();

const validateMeta = ajv.compile(metaSchema);

async function loadSchemaJson(schemaPath: string) {
  const schema = JSON.parse(await Deno.readTextFile(schemaPath)) as Schema;
  if (!validateMeta(schema)) {
    throw new Error(
      `Schema validation failed: ${JSON.stringify(validateMeta.errors)}`,
    );
  }
  return ajv.compile(schema).schema as Schema;
}

async function processSchemaFiles() {
  for await (const dirEntry of Deno.readDir("./schemas")) {
    if (!dirEntry.isDirectory) continue;
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
