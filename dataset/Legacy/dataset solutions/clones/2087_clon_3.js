function obtainRawInput() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}

function processInputSegment(segment, conversionType) {
  const numericValueConverter = (val) => Number(val);

  switch (conversionType) {
    case 0: return segment;
    case 1: return parseInt(segment, 10);
    case 2: return segment.split(" ");
    case 3: return segment.split("\n");
    case 4: return segment.split(" ").map(numericValueConverter);
    case 5: return segment.split("\n").map(numericValueConverter);
    case 6: return segment.split("");
    case 7: return segment.split("").map(numericValueConverter);
  }
}

function calculateOptimalPurchase(rawInputString) {
  const allInputLines = processInputSegment(rawInputString, 3);

  const configLineValues = processInputSegment(allInputLines[0], 4);
  const refrigeratorPrices = processInputSegment(allInputLines[1], 4);
  const microwavePrices = processInputSegment(allInputLines[2], 4);

  const [numRefrigerators, numMicrowaves, numDiscountOffers] = configLineValues;

  const minRefrigeratorPrice = Math.min(...refrigeratorPrices);
  const minMicrowavePrice = Math.min(...microwavePrices);
  let overallMinimumCost = minRefrigeratorPrice + minMicrowavePrice;

  const discountOfferLines = allInputLines.slice(3);
  const actualNumOffers = discountOfferLines.length;

  for (let i = 0; i < actualNumOffers; i++) {
    const currentOfferDetails = processInputSegment(discountOfferLines[i], 4);
    const [refrigeratorIndex, microwaveIndex, discountAmount] = currentOfferDetails;

    const adjustedRefIndex = refrigeratorIndex - 1;
    const adjustedMicIndex = microwaveIndex - 1;

    const costWithCurrentDeal = refrigeratorPrices[adjustedRefIndex] + microwavePrices[adjustedMicIndex] - discountAmount;

    if (costWithCurrentDeal < overallMinimumCost) {
      overallMinimumCost = costWithCurrentDeal;
    }
  }

  console.log(overallMinimumCost);
}

calculateOptimalPurchase(obtainRawInput());
