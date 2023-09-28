import { generatePizzaOrder, generatePizzaOrderSummary } from "./pizza.ts";
const query = Deno.args[0];
const pizzaOrder = await generatePizzaOrder(query);
const pizzaOrderSummary = await generatePizzaOrderSummary(pizzaOrder);
console.log(pizzaOrderSummary)
