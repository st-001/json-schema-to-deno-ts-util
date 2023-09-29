export default {
  $schema: "http://json-schema.org/draft-07/schema#",
  $id: "PizzaOrderItem",
  type: "object",
  description: "A pizza order item.",
  properties: {
    size: {
      type: "string",
      description:
        "The size of the pizza.",
      enum: ["small", "medium", "large"],
      default: "medium",
    },
    sauce: {
      type: "string",
      description:
        "The type of sauce on the pizza.",
      enum: ["tomato", "white", "bbq"],
      default: "tomato",
    },
    toppings: {
      type: "array",
      description:
        "The list of toppings on the pizza. Defaults to an empty array.",
      items: {
        type: "string",
      },
      default: [],
    },
    quantity: {
      type: "number",
      description: "The quantity of the pizza.",
      default: 1,
      minimum: 1,
    },
  },
  required: ["size", "sauce", "toppings", "quantity"],
};