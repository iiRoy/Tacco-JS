// This module is designed to meticulously process a provided string of raw input data.
// Its primary function is to analyze a pair of numbers extracted from this input
// and determine a specific mathematical property related to their divisibility by three.

function analyzeNumericTripletProperty(rawInputString) {
  // Defensive programming: Validate the initial input to ensure it's a non-empty string.
  if (typeof rawInputString !== 'string' || rawInputString.trim().length === 0) {
    console.error("Input processing terminated: Supplied data is either invalid or empty.");
    return; // Exit early if input is not suitable.
  }

  // Normalize and segment the input into an array of distinct lines.
  const dataLines = rawInputString.trim().split('\n');

  // Ensure that at least one line of data was successfully parsed.
  if (dataLines.length === 0) {
    console.error("Input processing terminated: No discernible lines found in the provided data.");
    return;
  }

  // Focus on the very first line, as per the expected input format.
  const targetLine = dataLines[0];

  // Break down the target line into individual string components, using space as the delimiter.
  const stringComponents = targetLine.split(' ');

  // Critical validation: Confirm that there are at least two numerical components expected.
  if (stringComponents.length < 2) {
    console.error("Input processing terminated: The first line does not contain the required two numerical values.");
    return;
  }

  // Attempt to convert the first two string components into base-10 integers.
  // Explicitly using parseInt with radix 10 for robust parsing.
  const firstNumericValue = parseInt(stringComponents[0], 10);
  const secondNumericValue = parseInt(stringComponents[1], 10);

  // Validate that both parsing operations yielded valid numbers.
  if (isNaN(firstNumericValue) || isNaN(secondNumericValue)) {
    console.error("Input processing terminated: One or both of the parsed values are not valid numbers.");
    return;
  }

  // Calculate the sum of the two parsed integers.
  const calculatedSum = firstNumericValue + secondNumericValue;

  // Evaluate the divisibility by 3 for each number and their sum.
  const isFirstValueDivisibleByThree = (firstNumericValue % 3 === 0);
  const isSecondValueDivisibleByThree = (secondNumericValue % 3 === 0);
  const isSumDivisibleByThree = (calculatedSum % 3 === 0);

  // Determine the final outcome based on the specified logical condition.
  // The condition is "Possible" if at least one of the three values (first number, second number, or their sum)
  // is perfectly divisible by three. Otherwise, it's "Impossible".
  let outcomeMessage;
  if (isFirstValueDivisibleByThree || isSecondValueDivisibleByThree || isSumDivisibleByThree) {
    outcomeMessage = "Possible";
  } else {
    outcomeMessage = "Impossible";
  }

  // Output the determined result to the standard console stream.
  console.log(outcomeMessage);
}

// This section handles the environment-specific input reading mechanism.
// It's designed to read from standard input, common in competitive programming environments.
try {
  // Dynamically import the Node.js file system module.
  const fileSystemUtility = require("fs");
  const standardInputFile = "/dev/stdin"; // Standard path for input in Unix-like systems.
  const dataEncoding = "utf8"; // Specify character encoding for input data.

  // Employ an asynchronous file read operation to fetch the complete input content.
  // This approach is generally preferred for non-blocking I/O, though competitive programming
  // often uses synchronous reads for simplicity.
  fileSystemUtility.readFile(standardInputFile, dataEncoding, (errorStatus, fileContent) => {
    if (errorStatus) {
      // Log any errors encountered during the file reading process.
      console.error("Critical error during standard input acquisition:", errorStatus.message);
      return; // Prevent further execution if input cannot be read.
    }
    // If input is successfully read, pass it to the main processing function.
    analyzeNumericTripletProperty(fileContent);
  });
} catch (runtimeError) {
  // Catch any exceptions that might occur during the setup of the file system operation (e.g., 'fs' module not found).
  console.error("An unexpected error occurred while setting up input stream:", runtimeError.message);
  // In a production scenario, alternative input methods or graceful degradation might be implemented here.
}