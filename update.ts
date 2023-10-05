import Ajv from "https://esm.sh/ajv@8.12.0";
import addFormats from "https://esm.sh/ajv-formats@2.1.1";
import metaSchema from "./metaSchema.json" assert { type: "json" };
import { formatDirectory } from "./utils.ts";

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

function propertyToInterfaceLine(key: string, prop: SchemaProperty): string {
  let type;

  if (prop.type === "array") {
    type = `${prop.items!.type}[]`;
  } else if (prop.enum) {
    type = prop.enum.map((value) =>
      typeof value === "string" ? `"${value}"` : value
    ).join(" | ");
  } else {
    type = prop.type;
  }

  return `  ${key}: ${type};\n`;
}

function generateTypeDefinitionInterface(schema: Schema): string {
  let interface_ = `export interface ${schema.$id} {\n`;

  for (const [key, prop] of Object.entries(schema.properties)) {
    interface_ += propertyToInterfaceLine(key, prop);
  }

  interface_ += "}";
  return interface_;
}

function generateEnumConstants(schema: Schema): string {
  let enums = "";
  for (const [key, prop] of Object.entries(schema.properties)) {
    if (prop.enum) {
      const enumName = key.toUpperCase() + "_ENUM";
      enums += `  static readonly ${enumName} = [${
        prop.enum.map((val) => (typeof val === "string" ? `"${val}"` : val))
          .join(", ")
      }] as const;\n`;
    }
  }
  return enums;
}

function decompressionForArrayType(
  originalProp: SchemaProperty,
  key: string,
  mapping: { property: string; enums?: { [index: number]: string | number } },
): string {
  const enumConstantName = `this.${mapping.property.toUpperCase()}_ENUM`;
  if (originalProp.items!.type === "number") {
    return `    ${mapping.property}: compressedData["${key}"],\n`;
  } else {
    return `compressedData["${key}"].map((v: number) => ${enumConstantName}[v]),\n`;
  }
}

function decompressionForEnumType(
  key: string,
  mapping: { property: string; enums?: { [index: number]: string | number } },
): string {
  const enumConstantName = `this.${mapping.property.toUpperCase()}_ENUM`;
  return `${enumConstantName}[compressedData["${key}"]],\n`;
}

function generateDecompressionLogic(
  originalProp: SchemaProperty,
  key: string,
  mapping: { property: string; enums?: { [index: number]: string | number } },
): string {
  let decompressionLogic = `    ${mapping.property}: `;

  if (originalProp.type === "array" && originalProp.enum) {
    decompressionLogic += decompressionForArrayType(originalProp, key, mapping);
  } else if (mapping.enums) {
    decompressionLogic += decompressionForEnumType(key, mapping);
  } else {
    decompressionLogic += `compressedData["${key}"],\n`;
  }

  return decompressionLogic;
}

function generateCompressionLogic(
  originalProp: SchemaProperty,
  key: string,
  mapping: { property: string; enums?: { [index: number]: string | number } },
): string {
  let compressionLogic = `    "${key}": `;

  if (originalProp.type === "array" && originalProp.enum) {
    const enumConstantName = `this.${mapping.property.toUpperCase()}_ENUM`;
    compressionLogic += `originalData.${mapping.property}.map((v: ${
      originalProp.items!.type
    }) => ${enumConstantName}.indexOf(v)),\n`;
  } else if (mapping.enums) {
    const enumConstantName = `this.${mapping.property.toUpperCase()}_ENUM`;
    const enumTypes = Object.keys(mapping.enums).map((idx) => idx).join(" | ");
    compressionLogic +=
      `${enumConstantName}.indexOf(originalData.${mapping.property}) as ${enumTypes},\n`;
  } else {
    compressionLogic += `originalData.${mapping.property},\n`;
  }

  return compressionLogic;
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

function generateAutoGeneratedComment(): string {
  return `
/**
* AUTO-GENERATED FILE - DO NOT EDIT.
* This file was automatically generated.
* Any changes made to this file will be overwritten.
*/
`;
}

function generateDecompressionFunction(
  originalSchema: Schema,
  mappingTable: MappingTable,
): string {
  let decompressionFunctionBody = `
  static decompress(compressedData: ${originalSchema.$id}Compressed): ${originalSchema.$id} {
    if (!this.validateCompressed(compressedData)) {
      throw new Error("Validation failed: " + this.ajv.errorsText(this.validateCompressed.errors));
    }

    return {
  `;

  for (const [key, mapping] of Object.entries(mappingTable)) {
    const originalProp = originalSchema.properties[mapping.property];
    decompressionFunctionBody += generateDecompressionLogic(
      originalProp,
      key,
      mapping,
    );
  }

  decompressionFunctionBody += "    };\n  }\n";
  return decompressionFunctionBody;
}

function generateCode(
  originalSchema: Schema,
  compressedSchema: Schema,
  mappingTable: MappingTable,
) {
  const autoGeneratedComment = generateAutoGeneratedComment();
  const typeDefinitionOriginal = generateTypeDefinitionInterface(
    originalSchema,
  );
  const typeDefinitionCompressed = generateTypeDefinitionInterface(
    compressedSchema,
  );
  const enumConstants = generateEnumConstants(originalSchema);

  const decompressionFunctionBody = generateDecompressionFunction(
    originalSchema,
    mappingTable,
  );

  let compressionFunctionBody = `
  static compress(originalData: ${originalSchema.$id}): ${originalSchema.$id}Compressed {
    if (!this.validate(originalData)) {
      throw new Error("Validation failed: " + this.ajv.errorsText(this.validate.errors));
    }

    return {
  `;

  for (const [key, mapping] of Object.entries(mappingTable)) {
    const originalProp = originalSchema.properties[mapping.property];
    compressionFunctionBody += generateCompressionLogic(
      originalProp,
      key,
      mapping,
    );
  }
  compressionFunctionBody += "    };\n  }\n";

  return `
${autoGeneratedComment}
import Ajv from "https://esm.sh/ajv@8.12.0";
import addFormats from "https://esm.sh/ajv-formats@2.1.1";

${typeDefinitionOriginal}
${typeDefinitionCompressed}

export class ${originalSchema.$id}Util {
  private static ajv = (() => {
    const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
    addFormats(ajv);
    return ajv;
  })();

  ${enumConstants}

  static readonly schema = Object.freeze(${
    JSON.stringify(originalSchema, null, 2)
  } as const);
  static readonly compressedSchema = Object.freeze(${
    JSON.stringify(compressedSchema, null, 2)
  } as const);
  static readonly schemaString = '${JSON.stringify(originalSchema)}' as const;
  static readonly compressedSchemaString = '${
    JSON.stringify(compressedSchema)
  }' as const;
  static validate = this.ajv.compile(this.schema);
  static validateCompressed = this.ajv.compile(this.compressedSchema);

  ${decompressionFunctionBody}
  ${compressionFunctionBody}
}
  `;
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
}

await processSchemaFiles();
await formatDirectory("./schemas");
