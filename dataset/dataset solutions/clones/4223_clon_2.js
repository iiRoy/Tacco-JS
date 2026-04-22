"use strict";

/*
 * This module provides a function to compute sequences of elements
 * where repetition of elements is allowed. It's akin to permutations
 * with replacement.
 */
const generateDuplicatePermutations = (
  inputElements,
  desiredLength
) => {
  // Base case for the recursion: if the target length is one,
  // each individual element is a valid permutation.
  if (desiredLength === 1) {
    return inputElements.map(singleElement => [singleElement]);
  }

  // An array to accumulate all the resulting permutations.
  const resultingPerms = [];

  // Recursively call the function to get permutations of a shorter length.
  const subPermutations = generateDuplicatePermutations(
    inputElements,
    desiredLength - 1
  );

  // Iterate through each available element to prepend it to the smaller permutations.
  inputElements.forEach((currentElement) => {
    subPermutations.forEach((subPermutation) => {
      // Concatenate the current element with each previously found sub-permutation.
      resultingPerms.push([currentElement].concat(subPermutation));
    });
  });

  // Return the complete collection of permutations.
  return resultingPerms;
};

// This function serves as the primary entry point for the application,
// processing input and seeking a specific mathematical outcome.
const executeProgram = inputData => {
    // Clean and split the raw input string into manageable parts.
    inputData = inputData.trim().split("\n");
    const firstNum = parseInt(inputData[0].charAt(0));
    const secondNum = parseInt(inputData[0].charAt(1));
    const thirdNum = parseInt(inputData[0].charAt(2));
    const fourthNum = parseInt(inputData[0].charAt(3));

    // Define the set of binary operations to be used in expressions.
    const operationSymbols = ["+", "-"];

    // Generate all possible sequences of three operators using the permutation logic.
    const expressionPatterns = generateDuplicatePermutations(operationSymbols, 3);

    // Iterate through each generated operator pattern to form and evaluate expressions.
    for (let patternIndex in expressionPatterns) {
        let currentExpressionParts = [];

        // Construct the arithmetic expression step by step.
        for (let partIndex = 0; partIndex < expressionPatterns[patternIndex].length; partIndex++) {
            if (partIndex === 0) {
                currentExpressionParts.push(firstNum);
            }

            if (partIndex === 1) {
                currentExpressionParts.push(secondNum);
            }

            if (partIndex === 2) {
                currentExpressionParts.push(thirdNum);
            }

            currentExpressionParts.push(expressionPatterns[patternIndex][partIndex]);
        }

        // Append the final number to complete the expression.
        currentExpressionParts.push(fourthNum);

        // Evaluate the constructed expression string.
        if (eval(currentExpressionParts.join("")) === 7) {
            // If the evaluation result is 7, output the expression and exit.
            console.log(currentExpressionParts.join("") + "=7");
            return;
        }
    }
};

// Execute the main program function, reading input from the standard input stream.
executeProgram(require('fs').readFileSync('/dev/stdin', 'utf8'));