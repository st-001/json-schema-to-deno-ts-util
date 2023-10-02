interface Customer {
  name: string;
  address: string;
  phone: string;
  email: string;
}
interface CustomerCompressed {
  1: any;
  2: any;
  3: any;
  4: any;
}
function decompressData(compressedData: CustomerCompressed): Customer {
  return {
    name: compressedData["1"],
    address: compressedData["2"],
    phone: compressedData["3"],
    email: compressedData["4"],
  };
}
