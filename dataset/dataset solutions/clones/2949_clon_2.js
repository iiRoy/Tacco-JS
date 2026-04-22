const getModule = require; // Function to retrieve modules

const fileAccess = getModule('fs'); // File system module accessor

const obtainFileContent = fileAccess.readFileSync; // Method for reading file data

const terminalOutput = console; // Reference to the standard output console

const showMessage = terminalOutput.log; // Function for displaying messages


/**
 * Primary routine for processing a given input string.
 * This function modifies a character at a specified position within a line of text.
 * @param {string} incomingData - The full string content provided as input.
 */
function ProcessData( incomingData ) {
  // Split the input into lines and select the second line for textual manipulation.
  let targetString = incomingData.split( '\n' )[ 1 ];

  // Parse the first line to extract the numeric position for modification.
  const modificationPoint = incomingData.split( '\n' )[ 0 ].split( ' ' )[ 1 ];

  // Convert the chosen string into an array of characters for index-based access.
  let stringCharsArray = targetString.split( '' );

  // Retrieve the character at the calculated index (adjusting for zero-based array)
  // and convert it to its lowercase equivalent.
  let convertedChar = targetString[ modificationPoint - 1 ].toLowerCase();

  // Substitute the original character at the modification point with its lowercase version.
  stringCharsArray.splice( modificationPoint - 1, 1, convertedChar );

  // Print the resulting character array, rejoined into a single string.
  showMessage( stringCharsArray.join( '' ) );
}


// Execute the main data processing function by reading the content of
// '/dev/stdin' as a UTF-8 encoded string.
ProcessData( obtainFileContent( '/dev/stdin', 'utf8' ) );