'use strict';

const fileSystemModule = require('fs');

// Read the entire content from standard input
const inputBuffer = fileSystemModule.readFileSync('/dev/stdin');
const rawInputString = inputBuffer.toString();

// Extract numeric components using a regular expression
// This handles potential leading/trailing whitespace and ensures only numbers are considered
const numberPattern = /-?\d+/g;
const stringNumbers = rawInputString.match(numberPattern);

// Convert the first three extracted string numbers to actual numeric values
const numericComponents = stringNumbers.slice(0, 3).map(val => parseInt(val, 10));

// Assign to distinct identifiers to avoid reusing original names (a, b, c)
const firstOperand = numericComponents[0];
const secondOperand = numericComponents[1];
const thirdOperand = numericComponents[2];

// Replicate the exact JavaScript behavior of `firstOperand < secondOperand < thirdOperand`
// This evaluates as `(firstOperand < secondOperand) < thirdOperand`
// Where `true` coerces to `1` and `false` coerces to `0` in the second comparison.
const intermediateComparisonResult = firstOperand < secondOperand; // This will be true or false
const numericIntermediateResult = Number(intermediateComparisonResult); // This will be 1 or 0

const finalEvaluationOutcome = numericIntermediateResult < thirdOperand; // This will be true or false

// Use a dispatch object to determine the output based on the final boolean outcome.
// This also ensures that 'Yes' and 'No' are treated as identifiers,
// replicating the original code's behavior (e.g., a ReferenceError if undefined).
const resultDispatcher = {
  true: Yes, // Will cause ReferenceError if Yes is not defined
  false: No  // Will cause ReferenceError if No is not defined
};

// Output the result
console.log(resultDispatcher[finalEvaluationOutcome]);
