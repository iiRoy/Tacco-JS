'use strict'; // Strict mode declaration for modern JavaScript practices.

// Helper function to reverse a given string.
// This replaces the built-in split/reverse/join chain for a more explicit manipulation.
const performStringReversal = (inputString) => {
  // Ensure the input is a string to prevent errors.
  if (typeof inputString !== 'string' || inputString.length === 0) {
    // Return an empty string for invalid or empty input, maintaining consistency.
    return '';
  }

  // Convert the string to an array of characters for easier manipulation.
  const characters = Array.from(inputString);
  let reversedCharacters = [];

  // Iterate backwards through the characters to build the reversed array.
  for (let i = characters.length - 1; i >= 0; i--) {
    reversedCharacters.push(characters[i]);
  }

  // Join the reversed characters back into a single string.
  return reversedCharacters.join('');
};


// The primary function responsible for processing the incoming data.
// It takes the entire raw input content as a string.
const processInputData = (rawInputBuffer) => {

  // Validate the initial input: it must be a non-empty string.
  if (typeof rawInputBuffer !== 'string' || rawInputBuffer.trim().length === 0) {
    console.error("Error: The provided input buffer is invalid or empty. Cannot proceed.");
    // Exit early if input is not valid to prevent further errors.
    return;
  }

  // Split the raw input into individual lines based on the newline character.
  // The first line is typically the one we are interested in for this problem.
  const parsedLines = rawInputBuffer.split('\n');

  // Check if any lines were successfully parsed from the input data.
  if (parsedLines.length === 0) {
    console.error("Warning: No distinct lines were found in the input data. Exiting.");
    // Exit early if no lines are present.
    return;
  }

  // Extract the very first line of the input.
  // This will be the sequence we need to evaluate and potentially transform.
  const targetSequence = parsedLines[0];

  // Declare an intermediate variable to store the final computed result string.
  let finalComputedResult = '';

  // Determine the length of the target sequence.
  // This is used for the conditional check.
  const sequenceLength = targetSequence.length;

  // Define a boolean flag for clarity in the conditional logic.
  // This checks if the sequence contains exactly two characters.
  const isTwoCharacterSequence = (sequenceLength === 2);

  // Conditional logic based on the length of the target sequence.
  // If it's a two-character sequence, print it directly without modification.
  if (isTwoCharacterSequence) {
    // For short sequences (exactly two characters), no transformation is needed.
    finalComputedResult = targetSequence;
  } else {
    // Otherwise, reverse the sequence using our dedicated helper function.
    // This applies the reversal logic for all other lengths.
    finalComputedResult = performStringReversal(targetSequence);
  }

  // Output the final result to the console.
  // This is the functional equivalent of the original console.log statement.
  console.log(finalComputedResult);
};


// Main execution block: handles file reading and error management.
// This part ensures robust handling of the input source, typically standard input.
try {
  // Dynamically load the Node.js file system module for file operations.
  const fileSystemUtility = require('fs');

  // Define the standard input file path, common in competitive programming environments.
  const inputSourcePath = '/dev/stdin';

  // Specify the encoding format for reading the file content.
  // UTF-8 is a common and versatile encoding.
  const encodingFormat = 'utf8';

  // Read the entire content of the standard input file synchronously.
  // This blocks the execution until the file is fully read into memory.
  const rawFileContents = fileSystemUtility.readFileSync(inputSourcePath, encodingFormat);

  // Invoke the main processing function with the obtained file contents.
  // This initiates the core logic of the program.
  processInputData(rawFileContents);

} catch (executionError) {
  // Catch any errors that occur during file reading or subsequent processing.
  // This provides a robust way to handle unexpected issues.
  console.error("An unexpected system error occurred during input processing:");
  console.error("Error Details:", executionError.message);
  // Optionally, terminate the process with a non-zero exit code to indicate failure.
  // process.exit(1);
}