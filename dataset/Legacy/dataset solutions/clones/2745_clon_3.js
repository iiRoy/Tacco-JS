"use strict";
(function(initialInputString){
  const ZERO_VALUE = 0;
  const THREE_VALUE = 3;

  // Process raw input string into an array of numbers
  const trimmedInputContent = initialInputString.trim();
  const stringTokens = trimmedInputContent.split(/\s+/);
  const numericData = stringTokens.map(strNum => Number(strNum));

  // Extract the count of elements to process (N)
  const totalElementsToProcess = numericData.shift();
  
  // Check condition A: N is divisible by 3
  const isNMultipleOfThree = (totalElementsToProcess % THREE_VALUE === ZERO_VALUE);

  // Check condition B: Sum of squares of remaining numbers is zero
  let currentSumOfSquares = ZERO_VALUE;
  for (const currentNumber of numericData) {
    currentSumOfSquares += currentNumber * currentNumber;
  }
  const isSumOfSquaresZero = (currentSumOfSquares === ZERO_VALUE);

  // Apply initial guard clauses based on conditions A and B
  if (!isNMultipleOfThree && !isSumOfSquaresZero) {
    console.log("No");
    return;
  }

  if (isSumOfSquaresZero) {
    console.log("Yes");
    return;
  }

  // If we reach here, it implies isNMultipleOfThree is true and isSumOfSquaresZero is false.
  // Proceed with the frequency counting logic.
  const distinctValuesCollection = [];
  const valueOccurrenceCounts = [ZERO_VALUE, ZERO_VALUE, ZERO_VALUE]; // Max 3 distinct values allowed

  let dataReadPointer = ZERO_VALUE;
  while (dataReadPointer < totalElementsToProcess) {
    const currentDistinctCount = distinctValuesCollection.length;

    // Guard against more than 3 distinct values
    if (currentDistinctCount > THREE_VALUE) {
      console.log("No");
      return;
    }

    let matchFoundForCurrentElement = false;
    for (let distinctIndex = ZERO_VALUE; distinctIndex < currentDistinctCount; distinctIndex++) {
      if (numericData[dataReadPointer] === distinctValuesCollection[distinctIndex]) {
        valueOccurrenceCounts[distinctIndex]++;
        dataReadPointer++; // Advance pointer to check the next element
        matchFoundForCurrentElement = true;
        break; // Exit inner loop, re-evaluate outer while loop with new dataReadPointer
      }
    }

    if (!matchFoundForCurrentElement) {
      // If the current element from numericData was not found among distinctValuesCollection
      distinctValuesCollection.push(numericData[dataReadPointer]);
      // Initialize frequency for the newly added distinct value to 1
      valueOccurrenceCounts[currentDistinctCount] = 1;
      dataReadPointer++; // Advance pointer to check the next element
    }
  }

  // Final check: Are the frequencies of the first three distinct values equal?
  const areAllFrequenciesIdentical = (
    valueOccurrenceCounts[ZERO_VALUE] === valueOccurrenceCounts[1] &&
    valueOccurrenceCounts[1] === valueOccurrenceCounts[2]
  );

  if (areAllFrequenciesIdentical) {
    console.log("Yes");
  } else {
    console.log("No");
  }

})(require("fs").readFileSync("/dev/stdin","utf8"));
