const retrieveInputData = () => require('fs').readFileSync('/dev/stdin', 'utf8');

console.log((incomingPayload => {
  const parsedLines = incomingPayload.trim().split('\n');
  const [initialMetadata, numericalElements] = parsedLines.map(r => r.split(' ').map(v => Number(v)));
  const [totalElementCount, desiredSelectionSize] = initialMetadata;
  const originalValues = numericalElements;

  const collectionOfPositives = originalValues.filter(val => val > 0).sort((a, b) => b - a);
  const collectionOfNegatives = originalValues.filter(val => val < 0).sort((a, b) => a - b);
  const countOfZeros = originalValues.filter(val => val === 0).length;

  const primeModulus = 1000000007n;
  const aggregateProduct = (currentAccumulator, itemValue) => (currentAccumulator * BigInt(itemValue) % primeModulus + primeModulus) % primeModulus;

  // Scenario 1: Must pick a zero, making product zero.
  if (desiredSelectionSize + countOfZeros > totalElementCount) {
    return '0';
  }

  // Scenario 2: Selection size is odd, no positives available.
  if (desiredSelectionSize % 2 === 1 && collectionOfPositives.length === 0) {
    if (countOfZeros > 0) {
      // With zeros present, an odd selection of only negatives results in zero.
      return '0';
    } else {
      // Only negatives, odd selection. Pick the 'desiredSelectionSize' least negative (largest magnitude) numbers.
      return collectionOfNegatives.slice(collectionOfNegatives.length - desiredSelectionSize).reduce(aggregateProduct, 1n).toString();
    }
  }

  let chosenElements = [];
  let positiveIndex = 0; // Pointer for collectionOfPositives (largest values)
  let negativeLeftIndex = 0; // Pointer for collectionOfNegatives (smallest magnitude values)
  let negativeRightIndex = collectionOfNegatives.length - 1; // Pointer for collectionOfNegatives (largest magnitude values)

  // If desiredSelectionSize is odd, pre-select the largest positive to make the remaining selection even.
  if (desiredSelectionSize % 2 === 1) {
    chosenElements.push(collectionOfPositives[positiveIndex++]);
  }

  // Now, the remaining elements to pick (to reach desiredSelectionSize) is even. We pick in pairs.
  while (chosenElements.length < desiredSelectionSize) {
    let firstPositive = null, secondPositive = null;
    if (positiveIndex + 1 < collectionOfPositives.length) {
      firstPositive = BigInt(collectionOfPositives[positiveIndex]);
      secondPositive = BigInt(collectionOfPositives[positiveIndex + 1]);
    }

    let firstNegative = null, secondNegative = null;
    if (negativeRightIndex - 1 >= negativeLeftIndex) {
      firstNegative = BigInt(collectionOfNegatives[negativeRightIndex]);
      secondNegative = BigInt(collectionOfNegatives[negativeRightIndex - 1]);
    }

    // Compare product of two largest positives vs. product of two largest magnitude negatives.
    if (firstPositive !== null && (firstNegative === null || (firstPositive * secondPositive) >= (firstNegative * secondNegative))) {
      chosenElements.push(Number(firstPositive));
      chosenElements.push(Number(secondPositive));
      positiveIndex += 2;
    } else if (firstNegative !== null) { // This means negative pair is better or positive pair is unavailable
      chosenElements.push(Number(firstNegative));
      chosenElements.push(Number(secondNegative));
      negativeRightIndex -= 2;
    } else {
      // This 'else' block should ideally not be reached if initial checks correctly handle insufficient elements.
      // It would imply that `desiredSelectionSize` is greater than the total number of available non-zero elements,
      // which is covered by the `desiredSelectionSize + countOfZeros > totalElementCount` check.
      break; 
    }
  }

  return chosenElements.reduce(aggregateProduct, 1n).toString();

})(retrieveInputData()));