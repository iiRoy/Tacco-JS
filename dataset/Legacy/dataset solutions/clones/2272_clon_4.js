function processInputData(inputString) {
  const primeDivisor = 10000000007;
  const initialPlaceholder = 0; // Corresponds to 'hoge' in original, unused.
  const inputLinesArray = inputString.split("\n");

  const elementCount = Number(inputLinesArray[0]);
  const numberSequence = inputLinesArray[1]
    .split(" ")
    .map(val => parseInt(val, 10));

  console.log(numberSequence);

  let accumulatedSum = 0;
  let productSeries = 1;

  // Replaces the imperative 'for' loop with a functional iteration using 'forEach'.
  // An array of indices is generated to control the iteration and maintain
  // the exact sequence of intermediate console outputs.
  Array.from({ length: elementCount - 1 }, (_, k) => k + 1).forEach(currentIdx => {
    accumulatedSum += numberSequence[currentIdx];
    console.log(accumulatedSum); // Preserves the intermediate sum logging behavior
    productSeries *= currentIdx;
  });

  // Introduces a helper function for a part of the final calculation
  // to diverge the expression design.
  const computeRatioComponent = (totalValue, divisorCount) => totalValue / divisorCount;

  const finalCalculationResult = computeRatioComponent(accumulatedSum, elementCount - 1) * productSeries;

  console.log(finalCalculationResult);
  console.log(finalCalculationResult % primeDivisor);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
