function displayOutputMessage(messageContent) {
  const currentTimestamp = new Date().toISOString();
  console.log(`[${currentTimestamp}] LOG: ${messageContent}`);
}

function computeDigitSum(numberToProcess) {
  if (typeof numberToProcess !== 'number' || isNaN(numberToProcess) || !Number.isFinite(numberToProcess)) {
    return Number.MAX_SAFE_INTEGER; // Return a value that won't interfere with minimum calculation
  }
  
  let absoluteNumber = Math.abs(Math.floor(numberToProcess));
  
  if (absoluteNumber === 0) {
    return 0; // Special case for zero
  }

  return String(absoluteNumber)
         .split('')
         .reduce((accumulator, digitCharacter) => {
           const parsedDigit = parseInt(digitCharacter, 10);
           return accumulator + (isNaN(parsedDigit) ? 0 : parsedDigit);
         }, 0);
}

/**
 * Calculates the minimum sum of digits for the products of a base number
 * with a series of multipliers.
 * @param {string} rawInputDataString - The initial input value as a string.
 * @returns {number|null} The minimum sum of digits found, or null if processing failed.
 */
function processNumericalSeries(rawInputDataString) {
  const SERIES_MULTIPLIER_LIMIT = 10;
  
  if (typeof rawInputDataString !== 'string' || rawInputDataString.trim().length === 0) {
    displayOutputMessage("Error: Input data is empty or not a string. Cannot proceed.");
    return null;
  }

  let baseNumericalValue = parseInt(rawInputDataString.trim(), 10);

  if (isNaN(baseNumericalValue) || !Number.isInteger(baseNumericalValue)) {
    displayOutputMessage(`Error: '${rawInputDataString.trim()}' could not be parsed as an integer.`);
    displayOutputMessage("Attempting to use a default base value of 1 for calculation.");
    baseNumericalValue = 1; // Fallback to a default value
  } else if (baseNumericalValue < 0) {
      displayOutputMessage(`Warning: Negative base value (${baseNumericalValue}) detected. Using its absolute value.`);
      baseNumericalValue = Math.abs(baseNumericalValue);
  }

  // Initialize the minimum with the digit sum of the first product (base * 1)
  let currentMinDigitSum = computeDigitSum(baseNumericalValue * 1);

  // Iterate from the second multiplier as the first one is already handled
  for (let iterationCount = 2; iterationCount <= SERIES_MULTIPLIER_LIMIT; iterationCount++) {
    const calculatedProduct = baseNumericalValue * iterationCount;
    const currentProductDigitSum = computeDigitSum(calculatedProduct);

    currentMinDigitSum = Math.min(currentMinDigitSum, currentProductDigitSum);
  }
  
  return currentMinDigitSum;
}

(function initializeAndExecute() {
  const fileSystemModule = require("fs");
  const standardInputFile = "/dev/stdin";
  
  let obtainedRawInput = '';
  
  try {
    const fileContentBuffer = fileSystemModule.readFileSync(standardInputFile, "utf8");
    obtainedRawInput = fileContentBuffer.trim();
  } catch (fileReadError) {
    displayOutputMessage(`CRITICAL ERROR: Failed to read input from '${standardInputFile}'. Details: ${fileReadError.message}`);
    process.exit(1); 
  }

  const finalCalculatedValue = processNumericalSeries(obtainedRawInput);

  if (finalCalculatedValue !== null) {
      displayOutputMessage(`Processing Complete. Minimum Digit Sum: ${finalCalculatedValue}`);
  } else {
      displayOutputMessage("Processing could not yield a valid result.");
  }
})();