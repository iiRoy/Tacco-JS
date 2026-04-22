'use strict';

/**
 * Initiates the primary data processing flow for the application.
 * This routine parses input, performs a comparative operation, and constructs a result string.
 * @param {string} rawInputString - The raw string data, expected to contain two space-separated numerical values.
 */
function ProcessInputData(rawInputString) {
  // Clean the raw input by removing leading/trailing whitespace
  // and then splitting it into an array of string segments using one or more spaces as delimiters.
  const inputSegments = rawInputString.trim().split(/\s+/);

  // Validate the number of input segments. If fewer than two are provided,
  // log a warning and exit the function, as the core logic requires two values.
  if (inputSegments.length < 2) {
    console.warn("Input error: Insufficient data points. Expected at least two numbers.");
    return;
  }

  // Convert the first two string segments into numerical values.
  // The unary plus operator (+) is used as a concise way to convert strings to numbers.
  const valueAlpha = +inputSegments[0];
  const valueBeta = +inputSegments[1];

  // Perform a validation check to ensure both converted values are indeed finite numbers.
  // If either is not a number (NaN) or is Infinity, log a warning and terminate.
  if (!Number.isFinite(valueAlpha) || !Number.isFinite(valueBeta)) {
    console.warn("Input error: One or both provided values are not valid finite numbers.");
    return;
  }

  // Declare variables to hold the string that will be repeated and the count of repetitions.
  let stringToDuplicate;
  let duplicationCount;

  // Compare the two numerical values to determine the repetition logic.
  // The smaller value (as a string) will be duplicated, and the larger value will dictate the count.
  if (valueAlpha < valueBeta) {
    stringToDuplicate = String(valueAlpha); // Explicitly convert number to string
    duplicationCount = valueBeta;
  } else {
    // If valueAlpha is greater than or equal to valueBeta
    stringToDuplicate = String(valueBeta); // Explicitly convert number to string
    duplicationCount = valueAlpha;
  }

  // Ensure the duplication count is not negative. A negative count would imply
  // an invalid operation or potentially lead to an infinite loop if not handled.
  // Adjust to zero if negative.
  if (duplicationCount < 0) {
    console.warn("Warning: Calculated duplication count is negative. Resetting to zero.");
    duplicationCount = 0;
  }

  // Initialize an empty string buffer to accumulate the final result.
  let accumulatedResultString = '';

  // Use a while loop to append the 'stringToDuplicate' to the buffer
  // for the specified 'duplicationCount' times.
  let loopIterator = 0;
  while (loopIterator < duplicationCount) {
    accumulatedResultString += stringToDuplicate;
    loopIterator++; // Increment the iterator for the next cycle.
  }

  // Before outputting, check if any content was generated.
  // If the result string is empty, provide a descriptive message; otherwise, output the result.
  const finalOutputMessage = accumulatedResultString.length > 0
    ? accumulatedResultString
    : "Operation completed, but no output string was generated.";

  // Display the final generated string or message to the console.
  console.log(finalOutputMessage);
}

// Entry point of the script:
// Reads the entire content of standard input (typically from a pipe or file redirection)
// as a UTF-8 encoded string and passes it to the main processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));