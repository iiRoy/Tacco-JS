'use strict'; // Enforce strict mode for cleaner code execution.

// Read input from standard input, decode as UTF-8, and split by newline characters.
const inputRows = require('fs').readFileSync(0, 'utf8').split('\n');

// Extract the first line of input, which is expected to be the target string.
const inputSequence = inputRows[0];

// Determine the last valid index of the input sequence.
const lastIndex = inputSequence.length - 1;

/**
 * Recursively calculates combinations of additions to the input sequence.
 * This function explores different ways to insert '+' operators into the sequence
 * and evaluates the resulting arithmetic expressions.
 *
 * @param {number} currentIndex - The current index being processed in the input sequence.
 * @param {number} currentTotal - The accumulated sum from previous recursive calls (not directly used in this specific sum logic, but passed along).
 * @param {string} expressionString - The string representing the arithmetic expression built so far.
 * @returns {number} The total sum of all valid evaluated expressions from this point.
 */
const calculateCombinations = (currentIndex, currentTotal, expressionString) => {
  // Base case: If we have reached the end of the input sequence,
  // append the last character and evaluate the complete expression.
  if (currentIndex === lastIndex) {
    return eval(expressionString + inputSequence[lastIndex]);
  }

  // Recursive step: Explore two paths for the current character:
  // 1. Append the current character and a '+' sign to the expression.
  // 2. Append only the current character (implying concatenation for the next number).
  currentTotal +=
    calculateCombinations(currentIndex + 1, currentTotal, expressionString + inputSequence[currentIndex] + '+') +
    calculateCombinations(currentIndex + 1, currentTotal, expressionString + inputSequence[currentIndex]);

  // Return the accumulated total from these recursive branches.
  return currentTotal;
};

// Initiate the recursive calculation starting from the first character (index 0),
// with an initial total of 0 and an empty expression string.
const finalResult = calculateCombinations(0, 0, '');

// Output the final computed result to the console.
console.log(finalResult);
