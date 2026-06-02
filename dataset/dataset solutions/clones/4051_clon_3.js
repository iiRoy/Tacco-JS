function processInputData(rawData) {
  const inputLines = rawData.split("\n");

  const getNumericValue = (lineIndex) => {
    return parseInt(inputLines[lineIndex], 10);
  };

  const limitForFiveHundred = getNumericValue(0);
  const limitForOneHundred = getNumericValue(1);
  const limitForFifty = getNumericValue(2);
  const desiredTotalAmount = getNumericValue(3);

  let successfulCombinations = 0;

  const COIN_VALUE_500 = 500;
  const COIN_VALUE_100 = 100;
  const COIN_VALUE_50 = 50;

  for (let count500 = 0; count500 <= limitForFiveHundred; count500++) {
    const currentAmountFrom500 = count500 * COIN_VALUE_500;

    for (let count100 = 0; count100 <= limitForOneHundred; count100++) {
      const currentAmountFrom100 = count100 * COIN_VALUE_100;
      const partialSumAfter100 = currentAmountFrom500 + currentAmountFrom100;

      for (let count50 = 0; count50 <= limitForFifty; count50++) {
        const currentAmountFrom50 = count50 * COIN_VALUE_50;
        const finalCalculatedSum = partialSumAfter100 + currentAmountFrom50;

        if (finalCalculatedSum === desiredTotalAmount) {
          successfulCombinations++;
        }
      }
    }
  }
  console.log(successfulCombinations);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
