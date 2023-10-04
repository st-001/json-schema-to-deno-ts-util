export async function formatDirectory(dirPath: string) {
  const command = new Deno.Command("deno", {
    args: ["fmt", dirPath],
  });
  const child = command.spawn();
  await child.status;
}
