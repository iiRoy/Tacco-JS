"use strict";

const processInput = (rawText) => {
  // The original code calculates the length of the input string.
  const characterCount = rawText.toString().length;

  // The original code attempts to parse a variable named 'input' which is
  // not yet defined in its scope, resulting in NaN. We replicate this behavior.
  let numericInterpretation = Number.parseInt(numericInterpretation, 10); // This will evaluate to NaN.

  // The original code then proceeds to extract 'digits' from this NaN.
  // Any arithmetic operation with NaN results in NaN.
  // The original loop effectively creates an array of 'characterCount' NaNs.
  const digitSequence = Array.from({ length: characterCount }, () => Number.NaN);

  // The original code sums these 'digits'. Summing NaNs yields NaN.
  let totalSummation = 0; // Initial value, but will be overridden by NaN.
  for (const individualDigit of digitSequence) {
    totalSummation += individualDigit; // 0 + NaN -> NaN; NaN + NaN -> NaN.
  }

  // The original code checks if the sum is 1. NaN == 1 is false.
  // Thus, the conditional branch for '1' is never taken.
  // We use a ternary operator for a different control flow structure.
  const finalResultValue = (totalSummation === 1) ? 10 : totalSummation;

  // The final NaN value is logged to the console.
  console.log(finalResultValue);
};

// The external contract for reading input remains unchanged.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
