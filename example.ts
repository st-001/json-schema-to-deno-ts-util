import {
  PizzaOrderItem,
  PizzaOrderItemCompressed,
  PizzaOrderItemUtil,
} from "./schemas/PizzaOrderItem/PizzaOrderItem.ts";

// Creating an original PizzaOrderItem
const originalOrder: PizzaOrderItem = {
  size: "large",
  sauce: "bbq",
  toppings: ["pepperoni", "mushrooms", "onions"],
  quantity: 2,
  instructions: "Extra crispy crust, please!",
};

// Printing the original order
console.log("Original Order:", originalOrder);

// Compressing the order
const compressedOrder: PizzaOrderItemCompressed = PizzaOrderItemUtil.compress(
  originalOrder,
);
console.log("Compressed Order:", compressedOrder);

// Decompressing the order back to its original form
const decompressedOrder: PizzaOrderItem = PizzaOrderItemUtil.decompress(
  compressedOrder,
);
console.log("Decompressed Order:", decompressedOrder);

// Validation of the original order
const isValidOriginal = PizzaOrderItemUtil.validate(originalOrder);
console.log("Is Original Order Valid?", isValidOriginal ? "Yes" : "No");

// Validation of the compressed order
const isValidCompressed = PizzaOrderItemUtil.validateCompressed(
  compressedOrder,
);
console.log("Is Compressed Order Valid?", isValidCompressed ? "Yes" : "No");

// Example of a compressed order
const predefinedCompressedOrder: PizzaOrderItemCompressed = {
  "1": 1,
  "2": 1,
  "3": ["olives", "spinach", "feta cheese"],
  "4": 1,
  "5": "Well done with extra cheese on top.",
};
console.log("Compressed:", predefinedCompressedOrder);

// Decompressing the predefined compressed order should output:
// {
//    "size": "medium",
//    "sauce": "white",
//    "toppings": ["olives", "spinach", "feta cheese"],
//    "quantity": 1,
//    "instructions": "Well done with extra cheese on top."
// }
const decompressedPredefinedOrder: PizzaOrderItem = PizzaOrderItemUtil
  .decompress(predefinedCompressedOrder);
console.log("Decompressed:", decompressedPredefinedOrder);

// Get original JSON schema string
const originalSchemaString = PizzaOrderItemUtil.schemaString;
console.log("Original Schema:", originalSchemaString);

// Get compressed JSON schema string
const compressedSchemaString = PizzaOrderItemUtil.compressedSchemaString;
console.log("Compressed Schema:", compressedSchemaString);
