export default {
  $schema: "http://json-schema.org/draft-07/schema#",
  $id: "Customer",
  type: "object",
  description: "A customer.",
  properties: {
    name: {
      type: "string",
      description: "The name of the customer.",
    },
    address: {
      type: "string",
      description: "The address of the customer.",
    },
    phone: {
      type: "string",
      description: "The phone number of the customer.",
    },
    email: {
      type: "string",
      description: "The email address of the customer.",
    },
  },
};
