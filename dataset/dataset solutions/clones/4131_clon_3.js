function processInputData(rawInputString) {
  // This function is designed to take a raw string input,
  // parse numeric values, and determine a comparison outcome.

  // Step 1: Clean up the input string by removing leading/trailing whitespace.
  const processedString = rawInputString.trim();

  // Step 2: Split the cleaned string into an array of individual string tokens.
  // We expect four space-separated numerical values.
  const stringTokens = processedString.split(" ");

  // Step 3: Validate the number of tokens to prevent errors during parsing.
  // If fewer than four tokens are present, log an error and exit.
  if (stringTokens.length < 4) {
    console.error("Error: Insufficient data provided. Expected 4 numeric values, but received " + stringTokens.length + ".");
    // An early return ensures the program doesn't attempt to access undefined array elements.
    return;
  }

  // Step 4: Define a robust parsing utility to convert string tokens to integers.
  // This helper function includes basic error handling for non-numeric input.
  const convertToSafeInteger = (strValue, baseRadix = 10) => {
    const parsedNumber = parseInt(strValue, baseRadix);
    // Check if the parsing operation resulted in a 'Not a Number' value.
    if (isNaN(parsedNumber)) {
      console.warn(`Warning: Could not convert "${strValue}" to an integer. Defaulting to 0 for calculation.`);
      return 0; // Provide a fallback value to maintain program flow.
    }
    return parsedNumber;
  };

  // Step 5: Parse the four expected numeric values using the safe conversion utility.
  const firstOperand = convertToSafeInteger(stringTokens[0]);
  const secondOperand = convertToSafeInteger(stringTokens[1]);
  const thirdOperand = convertToSafeInteger(stringTokens[2]);
  const fourthOperand = convertToSafeInteger(stringTokens[3]);

  // Optional: Log parsed values for debugging purposes.
  // console.log(`Debug: Parsed values are: ${firstOperand}, ${secondOperand}, ${thirdOperand}, ${fourthOperand}`);

  // Step 6: Compute the sum of the first pair of numbers.
  const sumOfInitialPair = firstOperand + secondOperand;

  // Step 7: Compute the sum of the second pair of numbers.
  const sumOfSecondaryPair = thirdOperand + fourthOperand; // Corrected from c+D to c+d equivalent

  // Step 8: Determine the comparison result based on the two sums.
  let finalOutcomeMessage; // Variable to store the descriptive result string.

  if (sumOfInitialPair > sumOfSecondaryPair) {
    // If the first sum is strictly greater.
    finalOutcomeMessage = "Left";
  } else {
    // If the first sum is not greater, it must be either equal or less than.
    if (sumOfInitialPair === sumOfSecondaryPair) {
      // If both sums are exactly equal.
      finalOutcomeMessage = "Balanced";
    } else {
      // If the first sum is less than the second (the only remaining possibility).
      finalOutcomeMessage = "Right";
    }
  }

  // Step 9: Output the determined comparison outcome to the console.
  console.log(finalOutcomeMessage);
}

// Standard boilerplate for reading input in a typical competitive programming environment.
// It reads the entire content of the standard input file.
const fileSystemModule = require('fs');
const standardInputFilePath = '/dev/stdin';
const characterEncoding = 'utf8';

// Read the synchronous content of the input file.
const rawInputContent = fileSystemModule.readFileSync(standardInputFilePath, characterEncoding);

// Initiate the main processing logic with the obtained raw input.
processInputData(rawInputContent);