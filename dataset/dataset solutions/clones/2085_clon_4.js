function processData(rawPayload) {
  const allLines = rawPayload.split('\n');

  const [alphaCount, betaCount, dealCount] = allLines[0].split(' ').map(Number);
  const itemCostsAlpha = allLines[1].split(' ').map(Number);
  const itemCostsBeta = allLines[2].split(' ').map(Number);

  const baseLineMinimum = Math.min(...itemCostsAlpha) + Math.min(...itemCostsBeta);

  const offerDetails = allLines.slice(3, 3 + dealCount).map(line => line.split(' ').map(Number));

  const specificOfferPrices = offerDetails.map(([alphaIndex, betaIndex, priceReduction]) => {
    return itemCostsAlpha[alphaIndex - 1] + itemCostsBeta[betaIndex - 1] - priceReduction;
  });

  const ultimateLowestPrice = Math.min(baseLineMinimum, ...specificOfferPrices);

  console.log(ultimateLowestPrice);
}

processData(require("fs").readFileSync("/dev/stdin", "utf8"));