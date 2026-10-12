"use strict";

// This function processes the provided input string.
function processInput(rawData) {
  // The input string is first split by newline characters,
  // and then each resulting string is converted into an integer.
  let numericValues = rawData.split(/\n/).map((val) => ~~val);

  // A Set data structure is initialized to keep track of unique numbers.
  let uniqueElementsTracker = new Set();

  // We iterate through the array of numbers, starting from the second element.
  // The first element is typically ignored based on common competitive programming patterns.
  for (let idx = 1; idx < numericValues.length; idx++) {
    // Check if the current number is already present in our tracker.
    if (uniqueElementsTracker.has(numericValues[idx])) {
      // If the number is found, it means it has appeared an even number of times so far,
      // so we remove it from the set.
      uniqueElementsTracker.delete(numericValues[idx]);
    } else {
      // If the number is not found, it means it has appeared an odd number of times,
      // so we add it to the set.
      uniqueElementsTracker.add(numericValues[idx]);
    }
  }

  // Finally, the total count of unique elements remaining in the set is printed to the console.
  console.log(uniqueElementsTracker.size);
}

// The main processing function is invoked with data read from standard input.
// The 'fs' module is used to read the file synchronously, and 'utf8' specifies the encoding.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
