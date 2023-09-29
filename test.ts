// deno-lint-ignore-file no-explicit-any
import Ajv from "https://esm.sh/ajv@8.12.0";
import addFormats from "https://esm.sh/ajv-formats@2.1.1";

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

const schemaDir = "./schemas";

async function loadSchemaJson(schemaPath: string) {
  return ajv.compile(JSON.parse(await Deno.readTextFile(schemaPath)))
    .schema as any;
}

for await (const dirEntry of Deno.readDir(schemaDir)) {
  const schemaPath = `${schemaDir}/${dirEntry.name}/schema.json`;
  const originalSchema = await loadSchemaJson(schemaPath);
}
