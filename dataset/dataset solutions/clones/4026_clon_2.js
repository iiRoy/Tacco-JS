const ioManager = require('fs'); // Acquire the file system interaction module

/**
 * Orchestrates the processing of incoming text data to compute
 * a differential score based on numerical values.
 * @param {string} sourceText - The complete string data obtained from input.
 */
function processInputData( sourceText )
{
  // Divide the entire input string into an array of distinct lines.
  let dataLines = sourceText.split( '\n' );

  // Parse the initial line to determine the total count of items.
  // Although 'totalElements' might not be directly utilized in this specific algorithm,
  // it is part of the established input format.
  let totalElements = parseInt( dataLines[0], 10 );

  // Retrieve the second line, which is expected to contain space-separated numeric values.
  let valueList = dataLines[1].split( ' ' );

  // Transform the array of string representations of numbers into an array of actual integers.
  valueList = valueList.map( elementText => parseInt( elementText, 10 ) );

  // Arrange the numerical items in descending order to facilitate alternating distribution.
  valueList.sort().reverse();

  // Initialize the cumulative scores for the two distinct participants.
  let firstPlayerTotal  =  0;
  let secondPlayerTotal = 0;

  // Iterate over each numeric item in the sorted collection, distributing them alternately
  // between the two players based on their sequential position.
  valueList.forEach( ( numericItem, position ) => {
    // If the current position (index) is odd, the item goes to the second player;
    // otherwise, it is assigned to the first player.
    if ( ( position % 2 ) === 1 )
    {
      secondPlayerTotal += numericItem;
    }
    else
    {
      firstPlayerTotal += numericItem;
    }
  } );

  // Calculate the ultimate difference between the accumulated scores of the two players.
  let scoreDifference = firstPlayerTotal - secondPlayerTotal;

  // Display the final computed score difference to the standard output stream.
  console.log( scoreDifference );
}

// Define a constant for the standard input file path, ensuring reusability and clarity.
const STANDARD_INPUT_PATH = '/dev/stdin';

// Read the entirety of the standard input file content synchronously,
// specifying UTF-8 encoding for proper character interpretation.
let rawData = ioManager.readFileSync( STANDARD_INPUT_PATH, 'utf8' );

// Initiate the primary data processing routine by passing the freshly read raw input.
processInputData( rawData );