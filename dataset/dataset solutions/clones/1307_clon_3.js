// This utility script is designed to capture and process textual data from the standard input stream.
// Its primary function is to perform a character-by-character case inversion:
// lowercase letters are converted to uppercase, and uppercase letters are converted to lowercase.
// All other characters remain unchanged.
// The script continuously accumulates all received input and re-processes the entire collected buffer
// whenever a new segment of data arrives.

// A mutable string buffer to store all data received from the input stream.
let cumulativeDataBuffer = '';

// Define symbolic constants for ASCII character code ranges.
// This enhances code readability and allows for easier modification if character sets were to change.
const ASCII_CODE_LOWERCASE_A = 'a'.charCodeAt(0);
const ASCII_CODE_LOWERCASE_Z = 'z'.charCodeAt(0);
const ASCII_CODE_UPPERCASE_A = 'A'.charCodeAt(0);
const ASCII_CODE_UPPERCASE_Z = 'Z'.charCodeAt(0);

/**
 * Executes a case inversion on a single character.
 * If the character is an alphabet, its case is flipped (e.g., 'a' -> 'A', 'B' -> 'b').
 * Non-alphabetic characters are passed through without modification.
 *
 * @param {string} characterToModify - The single character string to be processed.
 * @returns {string} The character with its case potentially inverted, or the original character.
 */
function performCaseInversion(characterToModify) {
  // A preliminary validation check for the input, ensuring it's a single character string.
  // While often guaranteed by string indexing, this adds a layer of robustness.
  if (typeof characterToModify !== 'string' || characterToModify.length !== 1) {
    console.warn(`Invalid input to performCaseInversion: ${characterToModify}. Returning as-is.`);
    return characterToModify;
  }

  const characterCodeValue = characterToModify.charCodeAt(0);

  // Determine if the character falls within the ASCII range for lowercase letters.
  if (characterCodeValue >= ASCII_CODE_LOWERCASE_A && characterCodeValue <= ASCII_CODE_LOWERCASE_Z) {
    return characterToModify.toUpperCase(); // Convert to uppercase.
  }
  // Determine if the character falls within the ASCII range for uppercase letters.
  else if (characterCodeValue >= ASCII_CODE_UPPERCASE_A && characterCodeValue <= ASCII_CODE_UPPERCASE_Z) {
    return characterToModify.toLowerCase(); // Convert to lowercase.
  }
  // If the character is not an alphabet, return it without any changes.
  else {
    return characterToModify;
  }
}

// Establish a constant reference to the standard input stream object.
// Using 'const' signifies that this reference will not be reassigned.
const standardInputSource = process.stdin;

// Activate the standard input stream to begin emitting data.
// Without this, the stream would remain paused and no 'data' events would fire.
standardInputSource.resume();

// Set the character encoding for the incoming data to UTF-8.
// This ensures multi-byte characters are correctly interpreted.
// 'utf8' is an alias for 'utf-8' and is commonly used in Node.js.
standardInputSource.setEncoding('utf8');

// Register an event handler for the 'data' event.
// This function will be invoked each time a new segment (chunk) of data is received.
standardInputSource.on('data', (incomingDataSegment) => {
  // Implement a guard clause to handle potential empty data segments,
  // although the 'data' event typically guarantees non-empty chunks.
  if (!incomingDataSegment || incomingDataSegment.length === 0) {
    console.debug('Received an empty data segment. No processing required for this chunk.');
    return; // Exit early if no data to process.
  }

  // Append the newly received data chunk to the end of our growing buffer.
  cumulativeDataBuffer += incomingDataSegment;

  // Initialize a fresh array to store the results of the character transformations for the current cycle.
  const transformedResultContainer = [];

  // Iterate over every character in the *entire* accumulated data buffer.
  // A traditional `for` loop provides explicit control over iteration.
  for (let characterIndex = 0; characterIndex < cumulativeDataBuffer.length; characterIndex++) {
    const currentCharacterFromBuffer = cumulativeDataBuffer[characterIndex];
    // Apply the case inversion logic using our dedicated helper function.
    const modifiedCharacter = performCaseInversion(currentCharacterFromBuffer);
    transformedResultContainer.push(modifiedCharacter); // Add the transformed character to our result array.
  }

  // Join all the processed characters back into a single string
  // and print it to the standard output.
  // A descriptive prefix is added to the output for better clarity, demonstrating an 'addition'.
  console.log('>>> Transformed Output: ' + transformedResultContainer.join(''));
});

// Attach an 'end' event listener to be notified when the input stream has finished providing data.
// This is an additional structural fragment not present in the original code, improving stream management.
standardInputSource.on('end', () => {
  // Log a message to the error stream (stderr) indicating the completion of input.
  // Using `console.error` for informational messages is a Type III variation.
  console.error('--- Standard input stream has gracefully terminated. All available data processed. ---');
  // Any final operations that should occur only once the entire input is received would be placed here.
});

// Implement an 'error' event handler for robust error management during stream operations.
// This is another additional fragment for enhanced reliability.
standardInputSource.on('error', (processingError) => {
  // Log the error message to the console.
  console.error('An unexpected error occurred during input stream processing:', processingError.message);
  // In a production scenario, you might want to exit the process with an error code.
  process.exit(1);
});

// Final comment: This marks the end of the script's core logic for input handling and transformation.