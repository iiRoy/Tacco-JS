"use strict"; // Enforces stricter parsing and error handling in the code

/*
 * This function serves as the primary entry point for processing
 * a given block of raw textual content. It analyzes this content
 * to determine if a specific pattern of consecutive identical pairs
 * appears at least three times within the input data.
 */
function checkSequentialPairs( rawInputText )
{

  // First, the raw input string is cleaned by removing leading/trailing whitespace,
  // and then split into an array of individual lines, using the newline character
  // as the delimiter. This creates an array where each element is a line from the input.
  let processedRows = rawInputText.trim().split( "\n" );

  // The very first line of the processed input is expected to contain a number.
  // This number indicates the total count of subsequent data rows that need to be examined.
  const totalDataRows = Number( processedRows[ 0 ] );

  // A counter is initialized to track the number of times a specific condition
  // (two elements in a row being equal) occurs consecutively.
  let consecutiveMatchCount = 0;

  // A loop is initiated to iterate through each relevant data row.
  // The iteration starts from the second line (index 1) because the first line
  // contains the `totalDataRows` count, not actual data for comparison.
  for ( let rowIndex = 1; rowIndex <= totalDataRows; rowIndex++ )
  {
    // Each current data row is split into its constituent parts based on a space delimiter.
    // This typically results in an array of two strings for each row.
    const currentRowParts = processedRows[ rowIndex ].split( " " );

    // A conditional check is performed to see if the first and second parts
    // of the current row are strictly equal in value.
    if ( currentRowParts[ 0 ] == currentRowParts[ 1 ] )
    {
      // If the parts are equal, the `consecutiveMatchCount` is incremented,
      // extending the current streak of matches.
      consecutiveMatchCount++;
    }
    else
    {
      // If the parts are not equal, the streak is broken, and the counter
      // is reset back to zero to start counting a new potential streak.
      consecutiveMatchCount = 0;
    }

    // Immediately after updating the counter, another check is made
    // to see if the `consecutiveMatchCount` has reached or exceeded the threshold of 3.
    if ( consecutiveMatchCount >= 3 )
    {
      // If the threshold is met, a positive confirmation message is printed to the console.
      console.log( "Affirmative" );
      // The function then terminates immediately, as the primary condition has been satisfied.
      return;
    }
  }

  // If the loop completes its entire iteration without the `consecutiveMatchCount`
  // ever reaching the threshold of 3, a negative confirmation message is printed.
  console.log( "Negative" );
}


/*
 * This auxiliary function is designed to sort a given array of numerical values
 * in ascending order. It utilizes a custom comparison function for accurate sorting.
 *
 * @param {Array<number>} inputArrayForSorting - An array containing numerical values.
 * @returns {Array<number>} The same array, but with its elements sorted numerically in ascending order.
 */
function sortNumericalValues( inputArrayForSorting )
{
  // The built-in `sort` method of the array is invoked,
  // passing our custom `numericComparisonFunction` to ensure proper numerical ordering.
  inputArrayForSorting.sort( numericComparisonFunction );
  // The now sorted array is returned to the caller.
  return inputArrayForSorting;
}


/*
 * This constant variable holds an anonymous function that acts as a comparator
 * for two numerical values. It is crucial for the `sort` method to correctly
 * order numbers in ascending sequence.
 *
 * @param {number} valueA - The first numerical value for comparison.
 * @param {number} valueB - The second numerical value for comparison.
 * @returns {number} A negative number if valueA should come before valueB,
 *                   a positive number if valueB should come before valueA,
 *                   or zero if their order does not matter.
 */
const numericComparisonFunction = function ( valueA , valueB )
{
  // Subtracting `valueB` from `valueA` yields the correct result for ascending order.
  // If `valueA` is smaller, result is negative; if `valueA` is larger, result is positive.
  return valueA - valueB;
};


// This is the main execution statement of the script.
// It reads the entire content from the standard input (`/dev/stdin`),
// decodes it as a UTF-8 string, and then passes this raw string
// to the `checkSequentialPairs` function for processing.
checkSequentialPairs( require( "fs" ).readFileSync( "/dev/stdin", "utf-8" ) );