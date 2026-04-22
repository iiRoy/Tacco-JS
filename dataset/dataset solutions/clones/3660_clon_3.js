// This function is designed to process a raw string input,
// which is expected to contain two lines of data.
// The first line should be a single integer, and the second line
// should contain space-separated integers.
// The primary goal is to calculate the sum of numbers from the second line
// and then subtract the single number from the first line from this sum.
function processInputData(inputContentString) {
  // Defensive programming: Check if the input is valid before proceeding.
  // An empty or non-string input would cause errors down the line.
  if (typeof inputContentString !== 'string' || inputContentString.trim() === '') {
    // Log an error message to the console if the input is invalid.
    console.error("Error: Input content must be a non-empty string.");
    return; // Exit the function gracefully.
  }

  // Split the entire input string into an array of individual lines.
  // Using `trim()` ensures that leading/trailing whitespace (like extra newlines)
  // around the whole input doesn't create empty lines or affect parsing.
  const contentLinesArray = inputContentString.trim().split('\n');

  // Validate that we have at least two lines as expected for our calculation.
  if (contentLinesArray.length < 2) {
    console.error("Error: Insufficient data. Expected at least two lines of input.");
    return;
  }

  // Extract the first line, which should contain the initial numeric value.
  const firstLineText = contentLinesArray[0];
  // Convert the text from the first line into an integer.
  // `parseInt` is used with a radix (base 10) for robust parsing.
  const baseNumericValue = parseInt(firstLineText, 10);

  // Check if the conversion resulted in a valid number.
  if (isNaN(baseNumericValue)) {
    console.error(`Error: Failed to parse a valid number from the first line: "${firstLineText}"`);
    return;
  }

  // Extract the second line, which contains multiple space-separated numbers.
  const secondLineNumbersText = contentLinesArray[1];

  // Helper function to safely parse an array of string numbers into an array of actual numbers.
  // This function includes additional validation for each number.
  const parseNumbersFromStringArray = (stringItems) => {
    const numericCollection = [];
    for (const itemString of stringItems) {
      const trimmedItem = itemString.trim();
      // Skip empty strings that might result from multiple spaces.
      if (trimmedItem === '') {
        continue;
      }
      const parsedNumber = Number(trimmedItem); // Use Number() for conversion
      if (!isNaN(parsedNumber)) {
        numericCollection.push(parsedNumber);
      } else {
        // Optionally log a warning for individual invalid numbers in the second line.
        console.warn(`Warning: Skipped non-numeric item "${trimmedItem}" from the second line.`);
      }
    }
    return numericCollection;
  };

  // Split the second line by spaces to get an array of string representations of numbers.
  const stringTokens = secondLineNumbersText.split(' ');
  // Convert these string tokens into actual numbers using our helper.
  const processedNumericList = parseNumbersFromStringArray(stringTokens);

  // Calculate the sum of all numbers in the processed list.
  let runningTotalSum = 0;
  // Iterate through the list to accumulate the sum.
  for (let i = 0; i < processedNumericList.length; i++) {
    runningTotalSum += processedNumericList[i];
  }

  // Perform the final calculation: total sum minus the base numeric value.
  const finalCalculatedValue = runningTotalSum - baseNumericValue;

  // Output the result to the standard output.
  console.log(finalCalculatedValue);
}

// This block handles reading input from the standard input stream
// and calling the main processing function.
// It uses Node.js's 'fs' module to simulate file system operations.
const fileSystemAPI = require("fs");
const standardInputPath = "/dev/stdin"; // Common path for standard input in Unix-like systems
const textEncoding = "utf8"; // Specify the character encoding for reading the file

try {
  // Read the entire content from stdin synchronously.
  const rawInputContentBuffer = fileSystemAPI.readFileSync(standardInputPath, textEncoding);
  // Ensure the content is a string before passing it to the processing function.
  processInputData(rawInputContentBuffer.toString());
} catch (readError) {
  // If any error occurs during file reading (e.g., file not found, permission issues),
  // log the error message.
  console.error(`An error occurred while attempting to read input: ${readError.message}`);
}