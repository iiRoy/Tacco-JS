// This function serves as the primary entry point for processing the provided data.
function processData( rawDataString )
{
  // First, eliminate any leading or trailing whitespace from the full input text.
  rawDataString = rawDataString.trim();

  // Extract the total count of numerical items from the very first segment of the input.
  // The first line is expected to contain this count, followed by other potential data.
  const itemQuantity = parseInt( rawDataString.split(" ")[0], 10 );

  // From the second line of the input, parse all space-separated values into an array of integers.
  // The 'map' function is used to convert each string segment into its numerical equivalent.
  let collectionOfNumbers = rawDataString
    .split('\n')[1]
    .split(' ')
    .map( (currentValueText) => parseInt(currentValueText, 10) );

  // Sort the array of numbers in ascending order.
  // A custom comparison function ensures correct numerical sorting.
  collectionOfNumbers.sort( function ( firstOperand, secondOperand ) {
    // If the first number is less than the second, it should precede it.
    if ( firstOperand < secondOperand )
      { return -1; }
    // If the first number is greater than the second, it should follow it.
    if ( firstOperand > secondOperand )
      { return 1; }
    // If both numbers are identical, their relative order is irrelevant.
    return 0;
  } );

  // Compute the difference between two specific elements within the now sorted array.
  // The indices are based on the 'itemQuantity' which is assumed to be the length of the array.
  // This calculation targets elements around the statistical median point.
  let calculatedDifference = collectionOfNumbers[ (itemQuantity / 2) + 1 ] - collectionOfNumbers[ itemQuantity / 2 ];

  // Display the final calculated numerical difference to the standard output.
  console.log( calculatedDifference );
}


// Initiate the data processing by reading the entire content from standard input.
// The 'fs' module is used for file system operations, and '/dev/stdin' represents standard input.
processData(
  require('fs').readFileSync(
    '/dev/stdin',
    'utf8'
  )
);