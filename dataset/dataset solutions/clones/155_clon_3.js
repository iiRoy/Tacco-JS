const fileSystemModule = require('fs');

// Determine the size of the standard input stream.
const inputDataLength = fileSystemModule.fstatSync(process.stdin.fd).size;

// Allocate a buffer to store the incoming data from standard input.
const dataBuffer = Buffer.alloc(inputDataLength);

// Read the data from standard input into the allocated buffer.
const actualBytesRead = fileSystemModule.readSync(process.stdin.fd, dataBuffer, 0, inputDataLength, 0);

// Convert the buffer content to a UTF-8 string, remove leading/trailing whitespace,
// and then split it into an array of individual lines.
const rawInputString = dataBuffer.toString('utf8', 0, actualBytesRead);
const inputLines = rawInputString.trim().split('\n');

// Initiate the main processing logic for the input data.
executeCardProcessing();

/**
 * Helper function to determine if a given array of 5 sorted numeric values
 * represents a "four card" hand (four cards of the same rank).
 *
 * @param {number[]} values - An array of 5 numbers, assumed to be sorted in descending order.
 * @returns {boolean} - True if the values represent a "four card" hand, false otherwise.
 */
function checkFourCardPattern(values) {
    // For a "four card" hand in a 5-card set, with values sorted descending,
    // either the first four cards are identical, or the last four cards are identical.
    // Example: [5, 5, 5, 5, 2] or [A, 3, 3, 3, 3]
    // The original logic checks these two specific patterns.

    const areFirstFourIdentical = (values[0] === values[1] &&
                                   values[1] === values[2] &&
                                   values[2] === values[3]);

    const areLastFourIdentical = (values[1] === values[2] &&
                                  values[2] === values[3] &&
                                  values[3] === values[4]);

    return areFirstFourIdentical || areLastFourIdentical;
}

/**
 * Processes each line of input to determine the type of card hand.
 * For this problem, it specifically checks for a "four card" hand.
 */
function executeCardProcessing(){
  // Define constants for the hand types to improve readability and maintainability.
  const FOUR_CARD_HAND_TYPE = "four card";
  const DEFAULT_HAND_TYPE = "null";

  // Iterate over each line of input received.
  for(let lineIndex = 0; lineIndex < inputLines.length; lineIndex++){
    const currentInputLine = inputLines[lineIndex].trim();
    const stringCardComponents = currentInputLine.split(',');

    // Convert the string components (card values) into numbers.
    // Use parseInt with radix 10 for explicit base conversion.
    const numericCardValues = stringCardComponents.map(component => parseInt(component, 10));

    // Sort the numeric card values in descending order.
    // This is crucial for the `checkFourCardPattern` helper function's logic.
    numericCardValues.sort((valueA, valueB) => valueB - valueA);

    // Initialize the result for the current hand.
    let determinedHandType = DEFAULT_HAND_TYPE;

    // Use the helper function to check if the current set of cards forms a "four card" pattern.
    if (checkFourCardPattern(numericCardValues)) {
      determinedHandType = FOUR_CARD_HAND_TYPE;
    }

    // Output the determined hand type to standard output.
    console.log(determinedHandType);
  }
}
