// deno-lint-ignore-file no-explicit-any
import Ajv from "https://esm.sh/ajv@8.12.0";
import addFormats from "https://esm.sh/ajv-formats@2.1.1";

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

function generateEnumMappingTable(
  enumValues: string[],
): { [key: string]: string } {
  const mappingTable: { [key: string]: string } = {};

  enumValues.forEach((value, index) => {
    mappingTable[value] = index.toString();
  });
  return mappingTable;
}

function generateMappingTables(
  schema: any,
): { [key: string]: { [key: string]: string } } {
  const mappingTables: { [key: string]: { [key: string]: string } } = {};
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
  enumValues: string[],
  mappingTable: { [key: string]: string },
): string[] {
  return enumValues.map((value) => mappingTable[value] || value);
}

function generateMappingTable(keys: string[]): { [key: string]: string } {
  const mappingTable: { [key: string]: string } = {};
  keys.forEach((key, index) => {
    mappingTable[key] = index.toString();
  });
  return mappingTable;
}

function compressSchemaKeys(
  schema: any,
  propertyMappingTable: { [key: string]: string },
  enumMappingTables: { [key: string]: { [key: string]: string } },
): any {
  if (Array.isArray(schema)) return schema;
  if (typeof schema !== "object" || schema === null) return schema;

  const compressed: any = {};
  for (const key in schema) {
    if (key === "properties" && typeof schema[key] === "object") {
      compressed[key] = {};
      for (const propertyKey in schema[key]) {
        const shortKey = propertyMappingTable[propertyKey] || propertyKey;
        if (schema[key][propertyKey].enum && enumMappingTables[propertyKey]) {
          const enumMappingStr = schema[key][propertyKey].enum
            .map((value: string) =>
              `${enumMappingTables[propertyKey][value]} = ${value}`
            )
            .join(", ");
          const newDescription = `${
            schema[key][propertyKey].description
          } Enum mapping: ${enumMappingStr}.`;
          const compressedDefault = schema[key][propertyKey].default
            ? enumMappingTables[propertyKey][schema[key][propertyKey].default]
            : undefined;
          compressed[key][shortKey] = {
            ...schema[key][propertyKey],
            description: newDescription,
            enum: compressEnumValues(
              schema[key][propertyKey].enum,
              enumMappingTables[propertyKey],
            ),
            default: compressedDefault,
          };
        } else {
          compressed[key][shortKey] = compressSchemaKeys(
            schema[key][propertyKey],
            propertyMappingTable,
            enumMappingTables,
          );
        }
      }
    } else if (key === "required" && Array.isArray(schema[key])) {
      compressed[key] = schema[key].map((propertyKey: string) =>
        propertyMappingTable[propertyKey] || propertyKey
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
  propertyMappingTable: { [key: string]: string };
  enumMappingTables: { [key: string]: { [key: string]: string } };
  interfaceName: string;
  compressedInterfaceName: string;
  originalTSInterface: string;
  compressedTSInterface: string;
}): string {
  const tsContent = `
  import Ajv from "https://esm.sh/ajv@8.12.0";
  import addFormats from "https://esm.sh/ajv-formats@2.1.1";

  ${originalTSInterface}

  ${compressedTSInterface}

  export const schema = ${JSON.stringify(schema, null, 2)};

  export const schemaCompressed = ${JSON.stringify(compressedSchema, null, 2)};

  export const propertyMappingTable = ${
    JSON.stringify(propertyMappingTable, null, 2)
  };

  export const enumMappingTables = ${
    JSON.stringify(enumMappingTables, null, 2)
  };

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
  `;
  return tsContent;
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
  tsInterface += "}\n";
  return tsInterface;
}

function generateCompressedTSInterface(
  schema: any,
  propertyMappingTable: { [key: string]: string },
  enumMappingTables: { [key: string]: { [key: string]: string } },
  name: string,
): string {
  let tsInterface = `export interface ${name} {\n`;
  for (const property in schema.properties) {
    const shortKey = propertyMappingTable[property] || property;
    let type = schema.properties[property].type;
    if (type === "array") {
      const itemsType = schema.properties[property].items.type;
      type = `${itemsType}[]`;
    } else if (schema.properties[property].enum) {
      type = schema.properties[property].enum.map((value: string) => {
        const enumMap = enumMappingTables[property];
        if (enumMap && enumMap[value]) {
          return `"${enumMap[value]}"`;
        }
        return `"${value}"`;
      }).join(" | ");
    } else if (type === "number") {
      type = "number | string";
    }
    tsInterface += `  ${shortKey}: ${type};\n`;
  }
  tsInterface += "}\n";
  return tsInterface;
}

async function loadSchemaJson(schemaPath: string) {
  return ajv.compile(JSON.parse(await Deno.readTextFile(schemaPath)))
    .schema as any;
}

async function processSchemaFiles() {
  for await (const dirEntry of Deno.readDir("./schemas")) {
    const schema = await loadSchemaJson(
      `./schemas/${dirEntry.name}/schema.json`,
    );
    const propertyMappingTable = generateMappingTable(
      Object.keys(schema.properties),
    );
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
      generateMappingTables(schema),
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

    // Construct the path to the folder based on the interface name
    const folderPath = `./schemas/${interfaceName}`;
    console.log(folderPath);

    // Ensure the folder exists before writing the file
    await Deno.mkdir(folderPath, { recursive: true });

    // Construct the path to the generated file
    const filePath = `${folderPath}/${interfaceName}.ts`;

    // Write the content to the file
    await Deno.writeTextFile(filePath, tsContent);
  }
}

await processSchemaFiles();
