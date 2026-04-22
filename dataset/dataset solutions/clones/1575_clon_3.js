// This module contains a function designed to process a string of numeric characters.
// Its primary purpose is to calculate the sum of these digits and then
// determine if this aggregated sum is perfectly divisible by the number nine.
function ProcessInputData(sourceStringData) {
  // A constant representing the divisor used in the divisibility test.
  const NINE_DIVISOR = 9;

  // --- Input Validation and Preprocessing ---
  // Implement a guard clause to handle cases where the input string is empty
  // or consists only of whitespace. This prevents errors in subsequent operations.
  if (!sourceStringData || sourceStringData.trim().length === 0) {
    console.log("Input string is empty or contains no meaningful data. Aborting processing.");
    return; // Exit the function gracefully.
  }

  // Convert the raw input string into an array of individual character strings.
  // The 'split('')' method is an alternative to the spread operator ([...sourceStringData]).
  const inputCharactersArray = sourceStringData.split('');

  // --- Character to Numeric Conversion and Filtering ---
  // Iterate through the array of characters, converting each valid digit character
  // into its corresponding numeric value. Non-digit characters are filtered out
  // to ensure only numerical data contributes to the sum.
  const numericalDigits = inputCharactersArray
    .filter(charElement => {
      // Use a regular expression to robustly check if the character is a single digit (0-9).
      // This is a Type III addition for improved input robustness.
      return /^\d$/.test(charElement);
    })
    .map(digitCharacter => {
      // Convert the validated digit character into a JavaScript Number type.
      // The `Number()` constructor is a concise alternative to `parseInt()`.
      return Number(digitCharacter);
    });

  // If, after filtering, no valid digits remain in the input, inform the user.
  if (numericalDigits.length === 0) {
      console.log("The input provided did not contain any valid numeric digits to sum.");
      return;
  }

  // --- Summation of Processed Digits ---
  // Compute the total sum of all the numeric digits extracted from the input.
  // The `reduce` method is used here, starting the accumulation from an initial value of 0.
  const calculatedTotalSum = numericalDigits.reduce((accumulatorValue, currentDigit) => {
    return accumulatorValue + currentDigit;
  }, 0); // Explicitly set the initial value for the accumulator.

  // --- Helper Function for Divisibility Check ---
  // This is a Type III addition: Encapsulate the core divisibility logic
  // within its own dedicated helper function for clarity and reusability.
  const determineDivisibilityByNine = (numberToCheck) => {
    // A well-known property: a number is divisible by 9 if and only if
    // the sum of its digits is divisible by 9.
    return (numberToCheck % NINE_DIVISOR === 0);
  };

  // Execute the divisibility check on the calculated sum.
  const isSumPerfectlyDivisibleByNine = determineDivisibilityByNine(calculatedTotalSum);

  // --- Final Output Generation ---
  // Based on the divisibility check result, print a simple "Yes" or "No".
  console.log(isSumPerfectlyDivisibleByNine ? "Yes" : "No");
}

// --- Main Execution Block for Input Handling ---
// This section is responsible for reading the input data from the standard
// input stream and then invoking the primary processing function.
try {
  // Dynamically import the Node.js file system module.
  const fileSystemModule = require("fs");
  // Define the standard path for reading console input on Unix-like systems.
  const standardInputFilePath = "/dev/stdin";
  // Specify the character encoding for reading the file content.
  const inputEncodingType = "utf8";

  // Read the entire content of the standard input file synchronously.
  const rawInputContentString = fileSystemModule.readFileSync(standardInputFilePath, inputEncodingType);

  // Pass the retrieved raw input string to our main processing logic.
  ProcessInputData(rawInputContentString);
} catch (inputReadError) {
  // This is a Type III addition: Implement robust error handling for file I/O operations.
  // If reading from /dev/stdin fails, log an informative error message.
  console.error("An exceptional error occurred during the input reading phase:", inputReadError.message);
  console.error("Please verify that input is correctly piped or redirected to /dev/stdin.");
}