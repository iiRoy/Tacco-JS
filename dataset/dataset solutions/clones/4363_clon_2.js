// This module handles basic data processing tasks.
function processInputData( rawData )
{
  // First, cleanse the incoming text by removing any extraneous leading or trailing spaces.
  let cleanedText = rawData.trim();

  // Next, convert the cleaned text into an array of numerical values.
  // The numbers are expected to be separated by a single space character.
  const numericalSequence = cleanedText.split(' ').map(Number);

  // Evaluate a specific condition: if the first element OR the second element
  // in the numerical sequence is precisely the integer nine.
  if (numericalSequence[0] === 9 || numericalSequence[1] === 9)
  {
    // If the condition holds true, signal an affirmative result.
    console.log('True');
  }
  else
  {
    // Otherwise, indicate a negative outcome.
    console.log('False');
  }
}

// Acquire the necessary file system utilities from the Node.js environment.
const fileSystemUtility = require('fs');

// Execute the primary data processing function.
// The input data is read synchronously from the standard input stream,
// using UTF-8 encoding to interpret the byte sequence into characters.
processInputData(
    fileSystemUtility
      .readFileSync(
        '/dev/fd/0', // Standard input file descriptor path on Unix-like systems.
        'utf-8'      // Specify the character encoding to prevent issues with special characters.
      )
);