// A simple module for processing numerical inputs from standard input.

// Define a constant for the input source path.
const INPUT_SOURCE_PATH = '/dev/stdin';

/**
 * Creates and returns a function that provides the next token from standard input.
 * It reads the entire input once and then yields tokens.
 * @returns {function(): string|undefined} A function to retrieve the next token, or undefined if no more tokens.
 */
const createInputTokenProvider = () => {
  /**
   * Generator function to parse raw input string into individual tokens.
   * @yields {string} A single token from the input.
   */
  function* generateTokensFromFile() {
    let fileContentRaw;
    try {
      // Synchronously read the entire content of the standard input file.
      fileContentRaw = require('fs').readFileSync(INPUT_SOURCE_PATH, 'utf8');
    } catch (error) {
      console.error(`Error reading input from ${INPUT_SOURCE_PATH}:`, error.message);
      // In a real application, you might want to exit or throw an error.
      fileContentRaw = ''; // Provide empty string to prevent further errors downstream.
    }

    // If the input is empty or just whitespace, there are no tokens to process.
    if (!fileContentRaw || fileContentRaw.trim().length === 0) {
      return; // Exit the generator early if no meaningful content is found.
    }

    // Split the trimmed content by one or more whitespace characters.
    const inputSegments = fileContentRaw.trim().split(/\s+/);

    // Iterate over each segment and yield it as a token for consumption.
    for (const currentSegment of inputSegments) {
      yield currentSegment;
    }
  }

  // Initialize the token generator. This sets up the stream.
  const tokenCursor = generateTokensFromFile();

  // Return a closure that fetches the next value from the generator.
  // This function will be called repeatedly by the consumer.
  return () => {
    return tokenCursor.next().value;
  };
};

/**
 * Executes the primary logic: reads three numbers, sorts them, and performs a specific calculation.
 * @param {function(): string|undefined} fetchNextNumericToken A function to get the next input token.
 */
const executeCoreLogic = (fetchNextNumericToken) => {
  const collectedNumbers = [];
  const expectedNumberCount = 3;

  // Loop to collect the required number of numerical inputs.
  for (let i = 0; i < expectedNumberCount; i++) {
    const rawToken = fetchNextNumericToken();

    // Basic validation: ensure a token was successfully received.
    if (typeof rawToken === 'undefined' || rawToken === null) {
      console.error(`Error: Expected ${expectedNumberCount} numbers but received only ${i}. Terminating execution.`);
      return; // Terminate execution if input is insufficient.
    }

    const currentNumber = Number(rawToken);

    // Validate if the parsed token is a valid number.
    if (Number.isNaN(currentNumber)) {
      console.error(`Error: Input token "${rawToken}" at position ${i + 1} is not a valid number. Terminating execution.`);
      return; // Terminate if non-numeric input is found.
    }
    collectedNumbers.push(currentNumber);
  }

  // A final check to ensure we have exactly three numbers before proceeding.
  if (collectedNumbers.length !== expectedNumberCount) {
    console.error(`Internal error: Expected ${expectedNumberCount} numbers, but collected ${collectedNumbers.length}. This should not happen after previous checks.`);
    return;
  }

  // Sort the collected numbers in ascending order.
  // Using an explicit comparator (a, b) => a - b ensures correct numerical sort.
  collectedNumbers.sort((a, b) => a - b);

  // Extract the sorted values into clearly named variables for the calculation step.
  const smallestValue = collectedNumbers[0];
  const middleValue = collectedNumbers[1];
  const largestValue = collectedNumbers[2];

  // Perform the specific calculation: largest number multiplied by 10, plus the sum of the other two.
  const intermediateProduct = largestValue * 10;
  const sumOfSmallerTwo = smallestValue + middleValue;
  const finalCalculatedResult = intermediateProduct + sumOfSmallerTwo;

  // Output the final result to the console with a descriptive message.
  console.log(`The computed value is: ${finalCalculatedResult}`);
};

// Initiate the application by first setting up the input provider,
// and then passing it to the core logic execution function.
executeCoreLogic(createInputTokenProvider());