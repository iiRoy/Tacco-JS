/*
 * This JavaScript module processes Roman numeral strings provided via standard input,
 * converting each valid line into its corresponding decimal integer equivalent.
 * It's designed to be robust against various input conditions, including empty lines
 * and unrecognized characters, while adhering to standard Roman numeral conversion rules.
 */

// A comprehensive mapping of individual Roman numeral symbols to their integer values.
// This data structure replaces the original's implicit string indexing and arithmetic
// with a more explicit and readable key-value association.
const SYMBOL_TO_NUMERIC_VALUE_MAP = new Map([
  ['I', 1],
  ['V', 5],
  ['X', 10],
  ['L', 50],
  ['C', 100],
  ['D', 500],
  ['M', 1000]
]);

/**
 * Ascertains the numerical value associated with a given Roman character.
 * This function acts as a lookup utility, making the conversion logic more modular.
 *
 * @param {string} romanChar - The single Roman numeral character to evaluate.
 * @returns {number} The integer value of the Roman character, or 0 if the character is not recognized.
 */
function deriveCharacterValue(romanChar) {
  // A proactive validation step to ensure only legitimate Roman symbols are processed.
  // Unrecognized symbols will trigger a warning and be treated as having zero value.
  if (!SYMBOL_TO_NUMERIC_VALUE_MAP.has(romanChar)) {
    console.error(`Warning: An invalid Roman symbol '${romanChar}' was encountered. It will be disregarded.`);
    return 0; // Return 0 to effectively ignore invalid characters in the sum.
  }
  return SYMBOL_TO_NUMERIC_VALUE_MAP.get(romanChar);
}

/**
 * Transforms an entire Roman numeral sequence into its base-10 decimal representation.
 * This function handles the additive and subtractive rules inherent in Roman numeral system.
 *
 * @param {string} inputRomanSequence - The complete Roman numeral string (e.g., "MCMXCIV").
 * @returns {number} The final decimal integer equivalent of the input sequence.
 */
function convertRomanNumeralToInteger(inputRomanSequence) {
  // Initial guard clause: If the input string is null, undefined, or merely empty after trimming,
  // it represents no value, thus returning zero.
  if (!inputRomanSequence || inputRomanSequence.trim().length === 0) {
    return 0;
  }

  let totalAccumulatedValue = 0; // The running total of the decimal conversion.
  let valueOfPreviousSymbol = 0; // Stores the value of the symbol processed immediately before the current one.

  // The original code iterated left-to-right. We maintain this direction but with clearer logic.
  // We iterate through each character of the Roman numeral string.
  for (let characterIndex = 0; characterIndex < inputRomanSequence.length; characterIndex++) {
    const currentSymbol = inputRomanSequence[characterIndex];
    const numericValueOfCurrent = deriveCharacterValue(currentSymbol);

    // If 'deriveCharacterValue' returned 0 because of an invalid character,
    // we simply skip this iteration, as a warning has already been issued.
    if (numericValueOfCurrent === 0 && !SYMBOL_TO_NUMERIC_VALUE_MAP.has(currentSymbol)) {
        continue;
    }

    // This conditional block addresses the subtractive rule in Roman numerals (e.g., IV = 4, IX = 9).
    // If the current symbol's value is greater than the preceding symbol's value,
    // it implies that the preceding symbol was meant to be subtracted, not added.
    // To correct this, we subtract the previous symbol's value twice:
    // once to negate its prior addition, and once more for the actual subtraction.
    if (numericValueOfCurrent > valueOfPreviousSymbol) {
      totalAccumulatedValue -= (valueOfPreviousSymbol * 2);
    }
    
    // In all cases, the current symbol's value is added to the running total.
    totalAccumulatedValue += numericValueOfCurrent;
    
    // Update the value of the previous symbol for the subsequent iteration.
    valueOfPreviousSymbol = numericValueOfCurrent;
  }

  return totalAccumulatedValue;
}

// Entry point of the script: Handles reading input, processing, and outputting results.
try {
  // Utilizing Node.js's 'fs' module to synchronously read all input from stdin.
  // This is a common pattern for processing batch inputs in command-line utilities.
  const fileSystemModule = require('fs');
  const entireInputBuffer = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

  // Break down the entire input buffer into an array of individual lines.
  const separateInputLines = entireInputBuffer.split('\n');

  // Process each line independently.
  for (const singleLine of separateInputLines) {
    // Only process lines that contain actual content after trimming whitespace.
    // Empty lines, or lines consisting only of whitespace, are skipped.
    if (singleLine.trim().length > 0) {
      // Convert the input line to uppercase for case-insensitive processing and then convert.
      const computedResult = convertRomanNumeralToInteger(singleLine.trim().toUpperCase());
      console.log(computedResult);
    }
  }
} catch (ioError) {
  // Comprehensive error handling for issues during file system operations or input reading.
  console.error("An operational error occurred during input processing:", ioError.message);
  // Exit the process with a non-zero status code to indicate an error condition.
  process.exit(1);
}