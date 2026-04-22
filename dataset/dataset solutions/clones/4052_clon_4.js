function calculateCombinations(sourceData) {
  const processedData = sourceData.trim().split('\n');
  const limit500 = parseInt(processedData[0]);
  const limit100 = parseInt(processedData[1]);
  const limit50 = parseInt(processedData[2]);
  const targetSum = parseInt(processedData[3]);

  const coinDenominations = [500, 100, 50];
  const coinLimits = [limit500, limit100, limit50];

  function explorePaths(currentCoinIndex, remainingAmount) {
    if (remainingAmount === 0) {
      return 1; // Successfully reached the target sum
    }
    if (remainingAmount < 0 || currentCoinIndex >= coinDenominations.length) {
      return 0; // Over-shot the target or no more coin types to use
    }

    let totalValidPaths = 0;
    const currentDenomination = coinDenominations[currentCoinIndex];
    const maxCountForThisCoin = coinLimits[currentCoinIndex];

    for (let count = 0; count <= maxCountForThisCoin; count++) {
      totalValidPaths += explorePaths(currentCoinIndex + 1, remainingAmount - (count * currentDenomination));
    }
    return totalValidPaths;
  }

  const finalResult = explorePaths(0, targetSum);
  console.log(finalResult);
}

calculateCombinations(require("fs").readFileSync("/dev/stdin", "utf8"));