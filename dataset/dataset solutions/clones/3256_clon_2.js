const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Convert the raw input string to a numerical starting point.
const initialValue = Number(rawData);

/**
 * Computes the next step in the Collatz sequence.
 * If the number is even, it's divided by 2.
 * If the number is odd, it's multiplied by 3 and 1 is added.
 * @param {number} currentNum - The current number in the sequence.
 * @returns {number} The next number in the sequence.
 */
const collatzStep = (currentNum) => {
  if (currentNum % 2 === 0) {
    return currentNum / 2;
  } else {
    return 3 * currentNum + 1;
  }
};

// This function is defined but not used in the main logic.
const previousStep = (inputVal) => {
  return collatzStep(inputVal - 1);
};

// An array to keep track of numbers encountered in the sequence.
const sequenceTracker = [];

/**
 * Checks if a given element is present in an array.
 * @param {Array<number>} collection - The array to search within.
 * @param {number} targetElement - The element to search for.
 * @returns {boolean} True if the element is found, false otherwise.
 */
const isElementPresent = (collection, targetElement) => {
  return collection.indexOf(targetElement) >= 0 ? true : false;
};

// Iterate through the Collatz sequence until a repeating number is found.
// The loop continues up to a large arbitrary limit to prevent infinite loops in case of unexpected behavior.
for (let currentTerm = initialValue; currentTerm < 1000000; currentTerm = collatzStep(currentTerm)) {
  // Check if the current number has already been encountered.
  if (isElementPresent(sequenceTracker, currentTerm)) {
    // If a repeat is found, print the position (1-indexed) where it first appeared.
    console.log(sequenceTracker.length + 1);
    break; // Exit the loop as the cycle is detected.
  } else {
    // If it's a new number, add it to our tracker.
    sequenceTracker.push(currentTerm);
  }
}
