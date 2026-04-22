function processInputData(rawDataString) {
  // Initial parsing step: splitting the raw data by newline characters.
  let parsedLines = rawDataString.split('\n');

  // Input sanitization: Remove any empty strings that might result from trailing newlines.
  // This ensures we only work with actual data lines, handling cases where the input ends with a newline.
  if (parsedLines.length > 0 && parsedLines[parsedLines.length - 1].trim() === '') {
    parsedLines.pop(); // Removing the last element if it's an empty line
  }

  // Extracting the primary iteration count from the first line of input.
  // The first line is expected to contain a single number, potentially followed by other data or spaces.
  // We take the first space-separated token and convert it to a numeric type.
  const configValueStr = parsedLines[0].split(' ')[0];
  let mainLoopIterations = Number(configValueStr);

  // Guard clause for invalid or non-positive iteration count.
  // If the extracted value is not a valid number or is zero/negative, a default value is used,
  // and an error message is logged for debugging purposes.
  if (isNaN(mainLoopIterations) || mainLoopIterations <= 0) {
    console.error("Warning: Invalid or non-positive iteration count provided. Proceeding with 1 iteration.");
    mainLoopIterations = 1; // Fallback to a default value to prevent infinite or negative loops.
  }

  // Initialize the sequence generator's starting value.
  // This variable will hold the current number to be printed and updated.
  let currentSequenceValue = 1;

  // Helper function to determine the increment based on the current value.
  // This logic calculates the next power of ten that should be added to the current value.
  // For example, if the current value is 1, it adds 1 (10^0). If it's 9, it adds 10 (10^1).
  // If it's 19, it adds 10 (10^1). If it's 99, it adds 100 (10^2).
  const calculateNextIncrement = (baseValue) => {
    let exponentBase = 1; // Starts at 10^0
    const valueForCheck = baseValue + 1; // The value whose magnitude determines the increment

    // Loop to find the largest power of 10 that is less than or equal to `valueForCheck`.
    // This effectively determines the magnitude (number of digits) of `valueForCheck`.
    while (exponentBase * 10 <= valueForCheck) {
      exponentBase *= 10;
    }
    return exponentBase;
  };

  // Iterating a predefined number of times to generate and print values.
  // The loop runs `mainLoopIterations` times, as determined from the input.
  for (let loopCounter = 0; loopCounter < mainLoopIterations; ++loopCounter) {
    // Output the current value in the sequence to standard output.
    // Each value is printed on a new line.
    console.log(currentSequenceValue);

    // Update the sequence value based on the custom increment logic.
    // The increment amount is calculated by the helper function.
    const incrementAmount = calculateNextIncrement(currentSequenceValue);
    currentSequenceValue += incrementAmount;
  }
}

// --- Standard Input/Output Handling ---
// This section reads from standard input and passes it to the main processing function.
// It should typically remain unchanged for problem submissions.
// Retrieves the entire content from standard input as a UTF-8 encoded string.
const standardInputContent = require("fs").readFileSync("/dev/stdin", "utf8");

// Invokes the primary function with the collected input.
// This initiates the data processing and sequence generation.
processInputData(standardInputContent);