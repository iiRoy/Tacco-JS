// Function responsible for executing the primary logic of the application.
function executeCoreLogic(rawInputLines) {
  // Defensive check: Ensure that sufficient input lines are provided.
  if (!Array.isArray(rawInputLines) || rawInputLines.length < 2) {
    console.error("Error: Not enough input lines provided to proceed with calculations.");
    return;
  }

  // Parse the first line of input to extract configuration parameters.
  const parsedConfigValues = parseLineOfNumbers(rawInputLines[0]);

  // Further validation for the configuration line.
  if (parsedConfigValues.length < 3) {
    console.error("Error: First input line does not contain the expected number of configuration values (n, m, x).");
    return;
  }

  // Extract individual configuration values.
  // Note: 'totalElements' (n) is parsed but not used in the original calculation logic,
  // demonstrating a potential "deletion" of an unused variable's purpose.
  const totalElements = parsedConfigValues[0]; // Corresponds to 'n' in original
  const targetBoundary = parsedConfigValues[1]; // Corresponds to 'm' in original
  const comparisonThreshold = parsedConfigValues[2]; // Corresponds to 'x' in original

  // Parse the second line of input, which contains the data elements.
  const dataElements = parseLineOfNumbers(rawInputLines[1]);

  // Initialize a counter for elements that exceed the specified threshold.
  let elementsExceedingThreshold = 0;

  // Iterate over each data element to determine how many are greater than the threshold.
  // This replaces the original 'filter().length' method with an explicit loop.
  for (let idx = 0; idx < dataElements.length; idx++) {
    const currentElement = dataElements[idx];
    if (currentElement > comparisonThreshold) {
      elementsExceedingThreshold++;
    }
  }

  // Calculate the complementary count based on the 'targetBoundary'.
  const remainingElementsCount = targetBoundary - elementsExceedingThreshold;

  // Determine the minimum of the two calculated counts.
  // This replaces 'Math.min()' with an explicit conditional statement.
  let finalCalculatedResult;
  if (elementsExceedingThreshold < remainingElementsCount) {
    finalCalculatedResult = elementsExceedingThreshold;
  } else {
    finalCalculatedResult = remainingElementsCount;
  }

  // Output the final result to the console.
  console.log(finalCalculatedResult);
}

// Utility function to convert a string of space-separated numbers into an array of integers.
function parseLineOfNumbers(inputStringLine) {
  const decimalRadix = 10; // Explicitly define radix for parseInt for robustness.
  const emptyNumericArray = []; // Constant for an empty result array.

  // Guard clause: Handle cases where input is not a valid string or is empty.
  if (typeof inputStringLine !== 'string' || inputStringLine.trim() === '') {
    // Optionally, could log a warning here.
    return emptyNumericArray;
  }

  // Split the input string into individual number strings.
  const stringifiedNumbers = inputStringLine.split(' ');

  // Transform each string segment into an integer using the map function.
  // This replaces the original 'for' loop and 'push' operations.
  const resultArray = stringifiedNumbers.map((numStr) => {
    const parsedValue = parseInt(numStr.trim(), decimalRadix);
    // If parsing fails (e.g., non-numeric string), treat it as 0 to avoid NaN in calculations.
    // This is an added robustness feature for Type III.
    return isNaN(parsedValue) ? 0 : parsedValue;
  });

  return resultArray;
}

// Global variable to buffer all incoming data from standard input.
let accumulatedInputBuffer = '';

// Immediately Invoked Function Expression (IIFE) to set up the standard input handling.
(function setupInputProcessing() {
  process.stdin.resume(); // Ensures the Node.js process stays active.
  process.stdin.setEncoding('utf8'); // Specifies UTF-8 encoding for input data.

  // Event listener for when data chunks are received from stdin.
  process.stdin.on('data', (incomingDataChunk) => {
    // Append each received chunk to the global buffer.
    accumulatedInputBuffer += incomingDataChunk;
  });

  // Event listener for when the standard input stream ends.
  process.stdin.on('end', () => {
    // Before processing, check if any data was actually collected.
    if (accumulatedInputBuffer.trim().length === 0) {
      console.error("Warning: No input data was received from standard input.");
      return;
    }

    // Split the entire accumulated buffer into an array of lines.
    // This prepares the input for the main logic function.
    const processedLines = accumulatedInputBuffer.split('\n');

    // Invoke the core logic function with the parsed input lines.
    executeCoreLogic(processedLines);
  });
})(); // The IIFE is executed immediately upon script load.