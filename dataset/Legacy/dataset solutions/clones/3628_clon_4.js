"use strict";

const DEBUG_MODE = false;
const rawInput = DEBUG_MODE
  ? "-9"
  : require("fs")
    .readFileSync("/dev/stdin", "utf8")
    .trim();

const negabaseConverter = (decimalValue) => {
  if (decimalValue === 0) {
    // The original code outputs an empty string for an input of 0.
    // This specific observable behavior is preserved.
    return "";
  }

  const recursiveConversion = (currentNumber, accumulatedDigits) => {
    if (currentNumber === 0) {
      return accumulatedDigits.join('');
    }

    let digit = currentNumber % -2;
    let nextNumber = Math.trunc(currentNumber / -2);

    if (digit < 0) {
      // Adjust negative remainder and quotient to fit negabase rules (digits 0 or 1)
      digit = 1;
      nextNumber += 1;
    }

    // Prepend the current digit to the accumulated list
    return recursiveConversion(nextNumber, [digit, ...accumulatedDigits]);
  };

  return recursiveConversion(decimalValue, []);
};

const executeConversion = (sourceData) => {
  const numericInput = parseInt(sourceData);
  const finalRepresentation = negabaseConverter(numericInput);
  console.log(finalRepresentation);
};

executeConversion(rawInput);
