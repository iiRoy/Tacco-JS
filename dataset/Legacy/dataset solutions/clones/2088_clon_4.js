function acquireInput() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}

function parseNumericLine(lineContent) {
  return lineContent.split(" ").map(Number);
}

function parseAllLines(fullText) {
  return fullText.split("\n");
}

function processData(rawData) {
  const allInputLines = parseAllLines(rawData);

  const [countAlpha, countBeta, numOffers] = parseNumericLine(allInputLines[0]);
  const alphaPrices = parseNumericLine(allInputLines[1]);
  const betaPrices = parseNumericLine(allInputLines[2]);

  const initialCombinedPrices = alphaPrices.flatMap(priceA =>
    betaPrices.map(priceB => priceA + priceB)
  );

  const discountOfferLines = allInputLines.slice(3);

  const discountedPrices = discountOfferLines.map(offerLine => {
    const [idxX, idxY, discountAmount] = parseNumericLine(offerLine);
    const baseIndex = (idxX - 1) * countBeta + (idxY - 1);
    return initialCombinedPrices[baseIndex] - discountAmount;
  });

  const allPossiblePrices = [...initialCombinedPrices, ...discountedPrices];

  console.log(Math.min(...allPossiblePrices));
}

processData(acquireInput());
