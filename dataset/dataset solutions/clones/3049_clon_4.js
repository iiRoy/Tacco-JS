"use strict"

function processData(rawData) {
  const numericTokens = rawData.match(/\d+/g);
  if (!numericTokens) {
    console.log(0); // Handle empty input gracefully, though competitive programming usually guarantees valid input.
    return;
  }
  
  const parsedValues = numericTokens.map(Number);

  // The first number in the input is the count of elements, but we extract the sequence directly
  const dataSequence = parsedValues.slice(1);

  // Utilize a functional reduction approach to iterate and accumulate state
  const tally = dataSequence.reduce((accumulator, currentElement) => {
    // If the current element is greater than or equal to the highest value encountered so far,
    // it signifies a new 'record' or 'peak'.
    if (currentElement >= accumulator.peakValue) {
      return {
        peakValue: currentElement, // Update the highest value to the current element
        recordCount: accumulator.recordCount + 1 // Increment the count of records set
      };
    } else {
      // Otherwise, the current element does not set a new record, so the state remains unchanged
      return accumulator;
    }
  }, { peakValue: 0, recordCount: 0 }); // Initial state: peak value starts at 0, record count at 0

  // Output the final count of records established
  console.log(tally.recordCount);
}

// Invoke the data processing function with input read from standard input
processData(require("fs").readFileSync("/dev/stdin", "utf8"));