const parseLineOfInts = (lineString) => {
  return lineString.split(" ").map(Number);
};

function calculateMinimumCost(rawInputString) {
  let inputLines = rawInputString.split("\n");

  const configLineString = inputLines.shift();
  const [numRefrigerators, numElectronics, numDiscounts] = parseLineOfInts(configLineString);

  const refrigeratorPrices = parseLineOfInts(inputLines.shift());
  const electronicsPrices = parseLineOfInts(inputLines.shift());

  const minRefrigeratorPrice = Math.min(...refrigeratorPrices);
  const minElectronicsPrice = Math.min(...electronicsPrices);

  let overallMinCost = minRefrigeratorPrice + minElectronicsPrice;

  inputLines.forEach(discountCouponEntry => {
    const [refItemIndexOneBased, elecItemIndexOneBased, discountValue] = parseLineOfInts(discountCouponEntry);

    const actualRefIndex = refItemIndexOneBased - 1;
    const actualElecIndex = elecItemIndexOneBased - 1;

    const selectedRefrigeratorPrice = refrigeratorPrices[actualRefIndex];
    const selectedElectronicsPrice = electronicsPrices[actualElecIndex];

    const costWithCurrentDiscount = selectedRefrigeratorPrice + selectedElectronicsPrice - discountValue;

    overallMinCost = Math.min(overallMinCost, costWithCurrentDiscount);
  });

  console.log(overallMinCost);
}

calculateMinimumCost(require("fs").readFileSync("/dev/stdin", "utf8"));
