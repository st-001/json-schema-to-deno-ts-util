interface PizzaOrderItem {
  size: string;
  sauce: string;
  toppings: string[];
  area: number;
  quantity: number;
  instructions: string;
  discountCodes: number[];
}
interface PizzaOrderItemCompressed {
  1: any;
  2: any;
  3: any;
  4: any;
  5: any;
  6: any;
  7: any;
}
function decompressData(
  compressedData: PizzaOrderItemCompressed,
): PizzaOrderItem {
  return {
    size: ["small", "medium", "large"][compressedData["1"]],
    sauce: ["tomato", "white", "bbq"][compressedData["2"]],
    toppings: compressedData["3"],
    area: [1, 2, 3][compressedData["4"]],
    quantity: compressedData["5"],
    instructions: compressedData["6"],
    discountCodes: compressedData["7"],
  };
}
