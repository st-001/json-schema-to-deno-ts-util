import Ajv from "https://esm.sh/ajv@8.12.0";
import addFormats from "https://esm.sh/ajv-formats@2.1.1";

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

const schemaDir = "./schemas";
for await (const dirEntry of Deno.readDir(schemaDir)) {
  const subSchemaDirPath = `${schemaDir}/${dirEntry.name}`;
  const schema = JSON.parse(
    await Deno.readTextFile(`${subSchemaDirPath}/schema.json`),
  );
  console.log(schema);
}
