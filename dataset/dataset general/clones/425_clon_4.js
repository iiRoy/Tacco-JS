function createDataVault() {
  const automotiveModels = ['Corvette', 'Mustang', 'Camaro'];
  const tropicalProduce = ['Papaya', 'Guava', 'Lychee'];

  const manufacturedGoods = automotiveModels.map((designation, idx) => ({
    uniqueId: idx + 1001,
    label: designation,
  }));

  const selectedManufacturedGood = [];

  const agriculturalProducts = tropicalProduce.map((label, idx) => ({
    productKey: idx + 2001,
    itemName: label,
  }));

  const selectedAgriculturalProduct = void 0; // Functionally equivalent to null, but different syntax

  return {
    goodsCollection: manufacturedGoods,
    primarySelection: selectedManufacturedGood,
    produceCollection: agriculturalProducts,
    secondarySelection: selectedAgriculturalProduct,
  };
}

const systemConfiguration = createDataVault();