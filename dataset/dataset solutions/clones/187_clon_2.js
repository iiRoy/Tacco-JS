/* This JavaScript file processes numerical input from standard input
 * to determine the range (maximum minus minimum) of the provided numbers.
 * It demonstrates basic asynchronous input handling and numerical comparisons.
 */

/**
 * Main execution routine for the application.
 * Initializes extrema, processes each line of input, and prints the final range.
 */
function   processNumericalData ( )
{
  // Declare and initialize variables for tracking the smallest and largest numbers found.
  // Using Number.POSITIVE_INFINITY and Number.NEGATIVE_INFINITY ensures any valid number
  // from the input will correctly update these initial values.
  let   smallestObserved   =   Number.POSITIVE_INFINITY ;
  let   largestObserved    =   Number.NEGATIVE_INFINITY ;

  // Iterate over each string entry in our collection of parsed input lines.
  parsedDataLines . forEach ( function ( currentLineContent )
  {
    // Attempt to convert the string content of the current line into a floating-point number.
    // This is crucial for handling decimal values correctly.
    let   numericValue   =   parseFloat ( currentLineContent ) ;

    // Update the smallest observed value by comparing the current numeric value
    // with the previously recorded smallest value.
    smallestObserved = determineMinimum ( numericValue , smallestObserved ) ;

    // Update the largest observed value by comparing the current numeric value
    // with the previously recorded largest value.
    largestObserved  = determineMaximum ( numericValue , largestObserved  ) ;
  } ) ; // End of the iteration over parsed input lines.

  // Output the calculated range, which is the difference between the largest and smallest numbers.
  console . log ( largestObserved - smallestObserved ) ;
} // End of the primary data processing function.


/**
 * Compares two numerical values and returns the smaller of the two.
 * @param {number} valueA - The first numerical operand.
 * @param {number} valueB - The second numerical operand.
 * @returns {number} The lesser of valueA and valueB.
 */
function    determineMinimum (    valueA   ,   valueB    )
{
  // A simple ternary operator is used for concise comparison.
  return    valueA    <    valueB    ?    valueA    :    valueB ;
} // End of the minimum determination utility.


/**
 * Compares two numerical values and returns the larger of the two.
 * @param {number} valueA - The first numerical operand.
 * @param {number} valueB - The second numerical operand.
 * @returns {number} The greater of valueA and valueB.
 */
function    determineMaximum (    valueA   ,   valueB    )
{
  // Another ternary operator for straightforward comparison.
  return    valueA    >    valueB    ?    valueA    :    valueB ;
} // End of the maximum determination utility.


// A global variable to accumulate all incoming data from standard input.
// It starts as an empty string and gets appended with new chunks of data.
var   incomingTextBuffer   =   '' ;

// Another global variable, intended to hold an array of parsed numeric strings
// once all input has been received and split into individual lines.
var   parsedDataLines    ;

// Prepare the standard input stream to begin receiving data.
process . stdin . resume ( ) ;

// Set the encoding for the incoming data to UTF-8, a common character encoding.
process . stdin . setEncoding ( 'utf8' ) ;

// Register an event listener for when new 'data' chunks arrive on standard input.
process . stdin . on ( 'data' , function ( dataBlock )
{
  // Append the newly received data chunk to our accumulating buffer.
  incomingTextBuffer   +=   dataBlock ;
} ) ; // End of data reception handler.

// Register an event listener for when the standard input stream signals 'end' (no more data).
process . stdin . on ( 'end' , function ( )
{
  // Once all data is received, split the entire buffer into an array of strings,
  // using the newline character as the delimiter. Each element will be a line.
  parsedDataLines = incomingTextBuffer . split ( '\n' ) ;

  // Initiate the primary data processing routine now that all input is available.
  processNumericalData ( ) ;
} ) ; // End of stream completion handler.