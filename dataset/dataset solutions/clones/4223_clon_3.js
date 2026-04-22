"use strict";

// This module provides a utility function for generating sequences
// with repetitions from a given set of choices.
// It's a recursive implementation to build combinations.
const produceCombinations = (itemChoices, sequenceLength) => {
  // Defensive programming: Validate input parameters.
  // An empty or invalid array of choices is a critical error for this function.
  if (!Array.isArray(itemChoices) || itemChoices.length === 0) {
    console.error("Input error: 'itemChoices' must be a non-empty array.");
    return []; // Return an empty array to indicate failure or no possible combinations.
  }

  // Handle edge cases for sequence length.
  // A sequence length of 0 should result in a single empty sequence.
  // Negative lengths are invalid and result in no sequences.
  if (sequenceLength < 0) {
    return [];
  }
  if (sequenceLength === 0) {
    return [[]]; // An array containing one empty array represents a sequence of length zero.
  }

  // Base case for the recursion: If the desired length is one,
  // each individual item choice forms a complete sequence.
  if (sequenceLength === 1) {
    // Transform each choice into a single-element array and collect them.
    // Using `map` for conciseness here.
    return itemChoices.map(singleChoice => [singleChoice]);
  }

  // Recursive step: Generate all combinations for a shorter sequence length.
  const subSequences = produceCombinations(itemChoices, sequenceLength - 1);

  // Initialize a collection to hold the final, longer sequences.
  const resultantSequences = [];

  // Iterate over each available item to prepend it to the shorter sequences.
  for (const currentElement of itemChoices) {
    // For every shorter sequence generated recursively, create a new sequence
    // by placing the current element at the beginning.
    for (const partialSequence of subSequences) {
      // Utilize the spread syntax for efficient array concatenation.
      resultantSequences.push([currentElement, ...partialSequence]);
    }
  }

  // Return the comprehensive list of all generated sequences.
  return resultantSequences;
};

// The primary function responsible for processing input and finding the target equation.
const findSevenEquation = (inputContent) => {
  // Initial input validation and sanitization.
  if (typeof inputContent !== 'string' || inputContent.length === 0) {
    console.error("Execution halted: Received invalid or empty input string.");
    return;
  }

  const trimmedInput = inputContent.trim();
  const inputLines = trimmedInput.split("\n");

  // Expecting a single line of exactly four numeric characters.
  if (inputLines.length === 0 || inputLines[0].length !== 4) {
    console.error("Input format issue: Please provide exactly four digits on a single line.");
    return;
  }

  // Extract individual digit characters and convert them to numbers.
  const rawDigitChars = inputLines[0].split("");
  const numericDigits = rawDigitChars.map(char => {
    const parsed = Number(char);
    // Basic validation for each digit.
    if (isNaN(parsed) || parsed < 0 || parsed > 9) {
      console.error(`Invalid digit detected: '${char}'. All inputs must be single digits.`);
      return NaN; // Indicate an error
    }
    return parsed;
  });

  // If any digit parsing failed, terminate.
  if (numericDigits.some(isNaN)) {
    return;
  }

  // Assigning digits to descriptive variables for improved readability.
  const firstDigit = numericDigits[0];
  const secondDigit = numericDigits[1];
  const thirdDigit = numericDigits[2];
  const fourthDigit = numericDigits[3];

  // Define the set of binary arithmetic operators to be used.
  const availableOperators = ["+", "-"];

  // Generate all possible ordered arrangements of 3 operators.
  // This is because we have 4 digits, requiring 3 operators to connect them.
  const operatorArrangements = produceCombinations(availableOperators, 3);

  // A sanity check, though for this problem's constraints, arrangements should always be found.
  if (operatorArrangements.length === 0) {
    console.warn("Algorithm warning: No operator arrangements could be generated. This is unexpected.");
    return;
  }

  // Iterate through each generated operator sequence.
  for (const currentOpSequence of operatorArrangements) {
    const expressionComponents = []; // Array to build the expression string parts.
    const allNumericOperands = [firstDigit, secondDigit, thirdDigit, fourthDigit]; // A direct list of numbers.

    // Construct the arithmetic expression string by interleaving numbers and operators.
    for (let opIndex = 0; opIndex < currentOpSequence.length; opIndex++) {
      // Append the digit that precedes the current operator.
      expressionComponents.push(allNumericOperands[opIndex]);
      // Append the operator itself.
      expressionComponents.push(currentOpSequence[opIndex]);
    }
    // After the loop, append the final digit, which follows the last operator.
    expressionComponents.push(allNumericOperands[allNumericOperands.length - 1]);

    // Join all parts to form the complete expression string.
    const completeExpression = expressionComponents.join("");

    // Attempt to evaluate the constructed expression.
    // NOTE: Using `eval()` is generally discouraged due to security risks with untrusted input.
    // However, in this specific context, the input digits and operators are strictly controlled,
    // making it a safe and convenient method for arithmetic evaluation.
    try {
      const evaluationResult = eval(completeExpression);

      // Check if the evaluated result matches the target value (7).
      if (evaluationResult === 7) {
        // If a solution is found, print it and immediately exit the function.
        console.log(`${completeExpression}=7`);
        return;
      }
    } catch (evaluationError) {
      // Log any errors that occur during expression evaluation, but continue searching.
      console.error(`Error encountered during evaluation of "${completeExpression}": ${evaluationError.message}`);
    }
  }

  // If the function reaches this point, no solution was found.
  // For the specific problem this code solves, a solution is guaranteed,
  // so this message is usually not reached. It's omitted for brevity as per "delete non-essential statements".
  // console.log("No valid equation evaluates to 7 using the provided digits and operators.");
};

// Self-executing anonymous function to handle input reading and function invocation.
(function() {
  // Read the entire content of standard input as a UTF-8 string.
  const standardInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
  // Invoke the main logic with the read input.
  findSevenEquation(standardInputData);
})();