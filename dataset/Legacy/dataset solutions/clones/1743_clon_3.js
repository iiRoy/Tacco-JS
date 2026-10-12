process.stdin.resume();
process.stdin.setEncoding("utf8");

process.stdin.on("data", (inputBuffer) => {
    const processedData = processInputData(inputBuffer);
    const finalSum = computeMinimumSum(processedData.selectionCount, processedData.rawPrices);

    console.log(finalSum);
});

const processInputData = (rawDataString) => {
  const inputLines = rawDataString.split("\n");

  const firstLineTokens = inputLines[0].split(" ");
  const totalItems = parseInt(firstLineTokens[0], 10);
  const selectionCount = parseInt(firstLineTokens[1], 10);

  const secondLineTokens = inputLines[1].split(" ");
  const rawPrices = secondLineTokens.map(priceStr => Number(priceStr));

  return {
    totalItems: totalItems,
    selectionCount: selectionCount,
    rawPrices: rawPrices,
  };
};

const comparePricesAscending = (priceA, priceB) => priceA - priceB;

const computeMinimumSum = (selectionCount, rawPrices) => {
  const itemPrices = [...rawPrices];

  itemPrices.sort(comparePricesAscending);

  let finalSum = 0;
  for (let i = 0; i < selectionCount; i++) {
    finalSum += itemPrices[i];
  }

  return finalSum;
};
