'use strict'
// This script processes input data to determine if a specific pattern exists.
function processData(rawData) {
  // Split the entire input string into an array of individual lines.
  const linesArray = rawData.split('\n');

  // Parse the first line to get the total number of items, converting it to an integer.
  const totalItems = parseInt(linesArray[0], 10);

  // Parse the second line: split by space, then convert each part to an integer.
  const decimalValues = linesArray[1].split(' ').map((decVal) => parseInt(decVal, 10));

  // Transform the decimal values into their binary string representations, then parse those as base-10 integers.
  // This effectively converts '5' (decimal) to '101' (binary string) then to 101 (decimal integer).
  const binaryRepresentations = decimalValues.map((val) => parseInt(val.toString(2)));

  // Initialize a new Map object to store the frequency of each binary representation.
  const frequencyStore = new Map();

  // Iterate over each binary value to populate the frequency map.
  for (let binVal of binaryRepresentations) {
    if (!frequencyStore.has(binVal)) {
      // If the value is not yet in the map, add it with a count of 1.
      frequencyStore.set(binVal, 1);
    } else {
      // If the value exists, increment its count.
      frequencyStore.set(binVal, frequencyStore.get(binVal) + 1);
    }
  }

  // Extract all unique keys (binary representations) from the frequency map.
  let uniqueValues = [];
  for (let uniqueKey of frequencyStore.keys()) {
    uniqueValues.push(uniqueKey);
  }

  // Get the count of distinct binary representations.
  let distinctCount = uniqueValues.length;

  // Initialize a boolean variable to track if the main condition is met.
  let isConditionMet = false;

  // Check the total number of items for divisibility by 3.
  if (totalItems % 3 === 0) {
    // Case 1: Three distinct binary representations.
    if (distinctCount === 3) {
      // Calculate the bitwise XOR sum of the three unique values.
      const bitwiseXorResult = uniqueValues[0] ^ uniqueValues[1] ^ uniqueValues[2];
      // If the XOR sum is 0, proceed to check frequencies.
      if (bitwiseXorResult === 0) {
        // All three unique values must appear exactly N/3 times.
        if ((frequencyStore.get(uniqueValues[0]) === totalItems / 3) && (frequencyStore.get(uniqueValues[1]) === totalItems / 3) && (frequencyStore.get(uniqueValues[2]) === totalItems / 3)) {
          isConditionMet = true; // Condition met.
        }
      }
    }
    // Case 2: Two distinct binary representations.
    else if (distinctCount === 2) {
      // Initially assume condition is met, then refine.
      isConditionMet = false; // Reset to false, will be set to true if specific conditions are met.
      // Check if one of the unique values is 0.
      if (uniqueValues.indexOf(0) !== -1) {
        // Remove 0 from the array to isolate the other unique value.
        uniqueValues.splice(uniqueValues.indexOf(0), 1);
        // Check if 0 appears N/3 times and the other unique value appears 2*N/3 times.
        if ((frequencyStore.get(0) === totalItems / 3) && (frequencyStore.get(uniqueValues[0]) === ((2 * totalItems) / 3))) {
          isConditionMet = true; // Condition met.
        }
      }
    }
    // Case 3: One distinct binary representation.
    else if (distinctCount === 1) {
      // The single unique value must be 0.
      if (uniqueValues[0] === 0) {
        isConditionMet = true; // Condition met.
      }
    }
  }
  // If totalItems is not divisible by 3.
  else {
    // Only one distinct binary representation is allowed in this case.
    if (distinctCount === 1) {
      // And that single unique value must be 0.
      if (uniqueValues[0] === 0) {
        isConditionMet = true; // Condition met.
      }
    }
  }

  // Output the result based on whether the condition was met.
  if (isConditionMet) {
    console.log('Yes');
  } else {
    console.log('No');
  }
}

// Read input from standard input and pass it to the processing function.
processData(require('fs').readFileSync('/dev/stdin', 'utf8'));