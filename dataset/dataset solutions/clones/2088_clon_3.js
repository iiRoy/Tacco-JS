function readInputData() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}

function processInputSegment(segmentContent, processingMode) {
  switch (processingMode) {
    case 0:
      return segmentContent;
    case 1:
      return parseInt(segmentContent);
    case 2:
      return segmentContent.split(" ");
    case 3:
      return segmentContent.split("\n");
    case 4:
      const spaceSeparatedNumbers = segmentContent.split(" ");
      return spaceSeparatedNumbers.map((itemStr) => Number(itemStr));
    case 5:
      const newlineSeparatedNumbers = segmentContent.split("\n");
      return newlineSeparatedNumbers.map((itemStr) => Number(itemStr));
    case 6:
      return segmentContent.split("");
    case 7:
      const charNumbers = segmentContent.split("");
      return charNumbers.map((itemStr) => Number(itemStr));
  }
}

function executeMainLogic(rawInputString) {
  const processedLines = processInputSegment(rawInputString, 3);

  const firstLineValues = processInputSegment(processedLines[0], 4);
  const countA = firstLineValues[0];
  const countB = firstLineValues[1];
  const numDiscountOffers = firstLineValues[2];

  const pricesA = processInputSegment(processedLines[1], 4);
  const pricesB = processInputSegment(processedLines[2], 4);

  const discountOfferLines = processedLines.slice(3);

  let allCalculatedPrices = [];

  for (let idxA = 0; idxA < countA; idxA++) {
    for (let idxB = 0; idxB < countB; idxB++) {
      const currentCombinedPrice = pricesA[idxA] + pricesB[idxB];
      allCalculatedPrices.push(currentCombinedPrice);
    }
  }

  const totalDiscountOffers = discountOfferLines.length;
  for (let offerIdx = 0; offerIdx < totalDiscountOffers; offerIdx++) {
    const currentOfferDetails = processInputSegment(discountOfferLines[offerIdx], 4);
    const discountIdxA = currentOfferDetails[0];
    const discountIdxB = currentOfferDetails[1];
    const discountAmount = currentOfferDetails[2];

    const originalPriceLookupIndex = (discountIdxA - 1) * countB + (discountIdxB - 1);
    const priceBeforeDiscount = allCalculatedPrices[originalPriceLookupIndex];
    
    allCalculatedPrices.push(priceBeforeDiscount - discountAmount);
  }

  console.log(Math.min.apply(null, allCalculatedPrices));
}

executeMainLogic(readInputData());
