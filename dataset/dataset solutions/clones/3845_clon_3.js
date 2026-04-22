// Configuration for the input/output system
const ioSystemConfig = {
  inputEncoding: 'utf-8',
  dataEventName: 'inputDataChunk',
  outputPrefix: '[RESULT]: ',
  errorPrefix: '[ERROR]: '
};

// Custom utility for displaying messages
const messageDisplay = {
  /**
   * Outputs a formatted message to the console.
   * @param {any} content The content to display.
   */
  logMessage: (content) => {
    const timestamp = new Date().toISOString();
    console.log(`${timestamp} ${ioSystemConfig.outputPrefix}${content}`);
  },
  /**
   * Outputs an error message.
   * @param {string} errorMessage The error message.
   */
  logError: (errorMessage) => {
    const timestamp = new Date().toISOString();
    console.error(`${timestamp} ${ioSystemConfig.errorPrefix}${errorMessage}`);
  }
};

/**
 * Parses an input line into individual string tokens.
 * Handles multiple spaces and trims empty tokens.
 * @param {string} rawLine The raw input string from stdin.
 * @returns {string[]} An array of cleaned string tokens.
 */
function parseInputTokens(rawLine) {
  // Trim leading/trailing whitespace from the entire line
  const trimmedLine = rawLine.trim();
  if (!trimmedLine) {
    return []; // Return empty array for empty lines
  }
  // Split by one or more whitespace characters and filter out any empty strings
  return trimmedLine.split(/\s+/).filter(Boolean);
}

/**
 * Performs the core conditional calculation based on two string inputs.
 * The comparison is lexicographical, but the subtraction involves numeric coercion.
 * @param {string} operandA The first string operand.
 * @param {string} operandB The second string operand.
 * @returns {string|number} The calculated value, which could be a string or a number.
 */
function determineAdjustedValue(operandA, operandB) {
  let computedOutcome;

  // Perform a lexicographical string comparison for the condition
  if (String(operandA) <= String(operandB)) {
    // If condition is met, the result is the first operand as a string
    computedOutcome = operandA;
  } else {
    // Otherwise, convert the first operand to a number and subtract one
    const numericA = Number(operandA);
    // Add a guard for non-numeric conversion resulting in NaN
    if (isNaN(numericA)) {
      messageDisplay.logError(`Invalid numeric conversion for '${operandA}'. Cannot perform subtraction.`);
      return null; // Indicate an error or uncomputable state
    }
    computedOutcome = numericA - 1;
  }

  return computedOutcome;
}

// Configure the standard input stream's data encoding
process.stdin.setEncoding(ioSystemConfig.inputEncoding);

// Attach a listener to the standard input stream for 'data' events
// This function will be executed whenever a line of data is received
process.stdin.on('data', (incomingPayload) => {
  // Enclose the entire processing logic in a try-catch block for robustness
  try {
    // Process the received line into distinct tokens
    const inputTokenArray = parseInputTokens(incomingPayload);

    // Validate that we have at least two tokens for our operation
    const minimumTokenCount = 2;
    if (inputTokenArray.length < minimumTokenCount) {
      messageDisplay.logError(`Insufficient input. Expected at least ${minimumTokenCount} tokens, received ${inputTokenArray.length}.`);
      return; // Skip processing if input is malformed
    }

    // Extract the primary string components from the token array
    const primaryComponentStr = inputTokenArray[0];
    const secondaryComponentStr = inputTokenArray[1];

    // Check if the extracted components are actually defined (not undefined/null)
    if (primaryComponentStr === undefined || secondaryComponentStr === undefined) {
      messageDisplay.logError('Input components could not be properly extracted. Check input format.');
      return;
    }

    // Perform the main calculation using the helper function
    const finalCalculatedResult = determineAdjustedValue(primaryComponentStr, secondaryComponentStr);

    // Only display the result if the calculation was successful (not null)
    if (finalCalculatedResult !== null) {
      messageDisplay.logMessage(finalCalculatedResult);
    } else {
        // An error was already logged by determineAdjustedValue, just return.
        // Or could add a more specific message here if needed.
        messageDisplay.logError('Calculation failed for provided inputs.');
    }

  } catch (processingError) {
    // Catch any unexpected errors during data processing
    messageDisplay.logError(`An unhandled exception occurred during input processing: ${processingError.message}`);
  }
});

// Optionally, add a listener for the 'end' event to signal completion
process.stdin.on('end', () => {
    messageDisplay.logMessage('Input stream ended. Shutting down processing.');
});

// Optionally, add a listener for the 'error' event to catch stream errors
process.stdin.on('error', (streamError) => {
    messageDisplay.logError(`An error occurred on the input stream: ${streamError.message}`);
});