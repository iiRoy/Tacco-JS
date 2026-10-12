"use strict";
(function(rawData){
  // Step 1: Process raw input string into an array of numbers
  const trimmedInput = rawData.trim();
  const stringValues = trimmedInput.split(/\s+/);
  const numericValues = stringValues.map(valStr => Number(valStr));

  // Step 2: Extract N, the number of elements to process, from the beginning of the array
  const numElementsToProcess = numericValues.shift();

  // Step 3: Evaluate initial conditions for early exit
  const isNModThreeZero = (numElementsToProcess % 3 === 0);
  const sumOfSquaresOfRemainingInputIsZero = (numericValues.reduce((accumulator, currentVal) => accumulator + currentVal * currentVal, 0) === 0);

  // Step 4: Handle early exit conditions based on the initial checks
  if (!isNModThreeZero && !sumOfSquaresOfRemainingInputIsZero) {
    console.log("No");
    return;
  }

  if (sumOfSquaresOfRemainingInputIsZero) {
    console.log("Yes");
    return;
  }

  // Step 5: Initialize data structures for tracking distinct values and their counts
  const distinctValues = [];
  const valueCounts = [0, 0, 0]; // Array to store counts for up to 3 distinct values

  // Step 6: Iterate through the input array to populate distinctValues and valueCounts.
  // This loop structure carefully mimics the original's behavior where the input index
  // can be advanced multiple times within a conceptual iteration if duplicates are found.
  let inputReadIndex = 0;
  let elementsProcessedCounter = 0; // Tracks how many elements from the original 'N' have been processed

  while (elementsProcessedCounter < numElementsToProcess) {
    const currentDistinctValueCount = distinctValues.length;

    // Early exit if more than 3 distinct values are encountered
    if (currentDistinctValueCount > 3) {
      console.log("No");
      return;
    }

    const currentInputValue = numericValues[inputReadIndex];
    let wasValueFoundInExisting = false;

    // Check if the current input value already exists in distinctValues
    for (let distinctValueIdx = 0; distinctValueIdx < currentDistinctValueCount; distinctValueIdx++) {
      if (currentInputValue === distinctValues[distinctValueIdx]) {
        valueCounts[distinctValueIdx]++; // Increment count for the existing value
        inputReadIndex++;               // Move to the next element in the input array
        elementsProcessedCounter++;     // Increment the total count of processed elements
        wasValueFoundInExisting = true;
        break;                          // Exit inner loop, as this input element is processed
      }
    }

    // If the current input value was not found among existing distinct values
    if (!wasValueFoundInExisting) {
      distinctValues.push(currentInputValue); // Add it as a new distinct value
      // Initialize its count. `valueCounts[currentDistinctValueCount]` refers to the
      // count for the newly added value (at index `currentDistinctValueCount`).
      valueCounts[currentDistinctValueCount]++;
      inputReadIndex++;                     // Move to the next element in the input array
      elementsProcessedCounter++;           // Increment the total count of processed elements
    }
  }

  // Step 7: Perform final checks after processing all input elements
  if (distinctValues.length > 3) {
    console.log("No");
    return;
  }

  // Helper function to encapsulate a specific count pattern check
  const checkSpecificCountPattern = (c0, c1, c2) => {
      // This condition checks if there are effectively only two distinct values (c2 is 0)
      // and one of their counts is exactly double the other.
      return (c2 === 0) && ((c0 === (2 * c1)) || (c1 === (2 * c0)));
  };

  const areAllCountsEqual = (valueCounts[0] === valueCounts[1]) && (valueCounts[1] === valueCounts[2]);
  const matchesTwoCountPattern = checkSpecificCountPattern(valueCounts[0], valueCounts[1], valueCounts[2]);

  if (!areAllCountsEqual && !matchesTwoCountPattern) {
    console.log("No");
    return;
  }

  // Step 8: Perform XOR sum check on distinct values.
  // If distinctValues.length is less than 3, accessing distinctValues[2] will yield undefined.
  // Performing XOR with undefined results in NaN, and NaN === 0 is false,
  // correctly leading to a "No" output in such cases.
  const xorSumOfDistinctValuesIsZero = (distinctValues[0] ^ distinctValues[1] ^ distinctValues[2]) === 0;

  // Step 9: Final output based on the XOR sum check
  if (!xorSumOfDistinctValuesIsZero) {
    console.log("No");
  } else {
    console.log("Yes");
  }

})(require("fs").readFileSync("/dev/stdin","utf8"));
