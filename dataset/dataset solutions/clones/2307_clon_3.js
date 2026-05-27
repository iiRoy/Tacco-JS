function main(inputLines) {
  const firstLineParts = inputLines[0].split(" ");
  let numElements = Number(firstLineParts[0]);
  let remainingOperations = Number(firstLineParts[1]);

  const sortedValues = inputLines[1].split(" ").map(Number).sort((a, b) => b - a);

  let totalSum = 0;
  const SINGLE_ITEM_OPERATION_COST = 1;
  const SINGLE_ITEM_VALUE_MULTIPLIER = 2;
  const PAIR_ITEM_OPERATION_COST = 2;

  processingLoop:
  for (let outerIndex = 0; outerIndex < numElements; outerIndex++) {
    const currentOuterValue = sortedValues[outerIndex];

    totalSum += currentOuterValue * SINGLE_ITEM_VALUE_MULTIPLIER;
    remainingOperations -= SINGLE_ITEM_OPERATION_COST;

    if (remainingOperations <= 0) {
      break processingLoop;
    }

    for (let innerIndex = outerIndex + 1; innerIndex < numElements; innerIndex++) {
      const currentInnerValue = sortedValues[innerIndex];
      const combinedPairValue = currentOuterValue + currentInnerValue;

      const effectiveMultiplierForPair = Math.min(PAIR_ITEM_OPERATION_COST, remainingOperations);
      totalSum += combinedPairValue * effectiveMultiplierForPair;

      remainingOperations -= PAIR_ITEM_OPERATION_COST;

      if (remainingOperations <= 0) {
        break processingLoop;
      }
    }
  }
  console.log(totalSum);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8').split("\n"));
