function computeAccumulationTerm(productValue, divisorValue) {
  const squaredProduct = productValue * productValue;
  return squaredProduct * divisorValue;
}

process.stdin.on("data", function(inputChunk) {
  const inputString = String(inputChunk);
  const trimmedInput = inputString.trim();
  const lines = trimmedInput.split("\n");

  const UPPER_BOUND_PRODUCT = 600;

  lines.some(function(lineStr) {
    const divisorVal = Number(lineStr);

    let multiplierIdx = 1;
    let accumulatorSum = 0;
    let currentProduct;

    while (true) {
      currentProduct = multiplierIdx * divisorVal;
      if (currentProduct >= UPPER_BOUND_PRODUCT) {
        break;
      }
      accumulatorSum += computeAccumulationTerm(currentProduct, divisorVal);
      multiplierIdx++;
    }

    console.log(accumulatorSum);
  });
}).resume();
