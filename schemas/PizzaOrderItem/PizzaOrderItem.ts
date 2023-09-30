
import Ajv from "https://esm.sh/ajv@8.12.0";
import addFormats from "https://esm.sh/ajv-formats@2.1.1";
export interface PizzaOrderItem { size: "small" | "medium" | "large"; sauce: "tomato" | "white" | "bbq"; toppings: string[]; quantity: number;}
export interface PizzaOrderItemCompressed { 0: "0" | "1" | "2"; 1: "0" | "1" | "2"; 2: string[]; 3: number | string;}
export const schema = {"$id":"PizzaOrderItem","type":"object","description":"A pizza order item.","properties":{"size":{"type":"string","description":"The size of the pizza.","enum":["small","medium","large"],"default":"medium"},"sauce":{"type":"string","description":"The type of sauce on the pizza.","enum":["tomato","white","bbq"],"default":"tomato"},"toppings":{"type":"array","description":"The list of toppings on the pizza.","items":{"type":"string"},"default":[]},"quantity":{"type":"number","description":"The quantity of the pizza.","default":1,"minimum":1}},"required":["size","sauce","toppings","quantity"]};
export const schemaCompressed = {"$id":"PizzaOrderItem","type":"object","description":"A pizza order item.","properties":{"0":{"type":"string","description":"The size of the pizza. Enum mapping: 0 = small, 1 = medium, 2 = large.","enum":["0","1","2"],"default":"1"},"1":{"type":"string","description":"The type of sauce on the pizza. Enum mapping: 0 = tomato, 1 = white, 2 = bbq.","enum":["0","1","2"],"default":"0"},"2":{"type":"array","description":"The list of toppings on the pizza.","items":{"type":"string"},"default":[]},"3":{"type":"number","description":"The quantity of the pizza.","default":1,"minimum":1}},"required":["0","1","2","3"]};
export const propertyMappingTable = {"size":"0","sauce":"1","toppings":"2","quantity":"3"};
export const enumMappingTables = {"size":{"small":"0","medium":"1","large":"2"},"sauce":{"tomato":"0","white":"1","bbq":"2"}};
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
const validate = ajv.compile(schemaCompressed);
export function validateData(data: PizzaOrderItemCompressed): { valid: boolean; errors: any } {
const valid = validate(data);
return {
valid,
errors: validate.errors,
};
}
