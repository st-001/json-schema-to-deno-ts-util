import { assertEquals } from "https://deno.land/std@0.201.0/assert/mod.ts";
import { convertSauce, convertSize } from "./pizza.ts";

Deno.test(function convertSauceTest() {
  assertEquals(convertSauce("t"), "tomato");
  assertEquals(convertSauce("w"), "white");
  assertEquals(convertSauce("b"), "bbq");
});

Deno.test(function convertSizeTest() {
  assertEquals(convertSize("s"), "small");   
  assertEquals(convertSize("m"), "medium");
  assertEquals(convertSize("l"), "large");
});
