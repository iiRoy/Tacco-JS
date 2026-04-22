"use strict" ; // Enforce strict parsing and error handling rules.

/**
 *   @function processInput
 *   @description This function processes the incoming text data,
 *                parses a numerical value, and prints a corresponding
 *                rating based on predefined ranges.
 *   @param {string} sourceData The raw text data received for processing.
 *   @returns {void} No explicit return value; directly outputs to console.
 */
function processInput ( sourceData )
{
  // First, clean up the input data by removing leading/trailing whitespace.
  sourceData = sourceData . trim ( ) ;

  // Convert the cleaned string into an integer for numerical comparisons.
  const scoreMetric = Number . parseInt ( sourceData , 10 ) ; // Explicitly using radix 10 for clarity.

  // Evaluate the score metric against various thresholds
  // and print a specific numeric rating.
  if ( scoreMetric >= 400 && scoreMetric <= 599 ) {
    console . log ( "8" ) ;
  }
  if ( scoreMetric >= 600 && scoreMetric <= 799 ) {
    console . log ( "7" ) ;
  }
  if ( scoreMetric >= 800 && scoreMetric <= 999 ) {
    console . log ( "6" ) ;
  }
  if ( scoreMetric >= 1000 && scoreMetric <= 1199 ) {
    console . log ( "5" ) ;
  }
  if ( scoreMetric >= 1200 && scoreMetric <= 1399 ) {
    console . log ( "4" ) ;
  }
  if ( scoreMetric >= 1400 && scoreMetric <= 1599 ) {
    console . log ( "3" ) ;
  }
  if ( scoreMetric >= 1600 && scoreMetric <= 1799 ) {
    console . log ( "2" ) ;
  }
  if ( scoreMetric >= 1800 && scoreMetric <= 1999 ) {
    console . log ( "1" ) ;
  }
} // End of processInput function definition.

/**
 *   @function orderNumericItems
 *   @description Sorts a given collection of numbers in ascending order.
 *   @param {Array<number>} itemsToOrder A list of numerical values.
 *   @returns {Array<number>} The same list, but with its elements sorted.
 */
function orderNumericItems( itemsToOrder )
{
  // Apply the custom comparison function to sort the array.
  itemsToOrder . sort ( comparisonFunction ) ;

  // Return the now sorted collection.
  return itemsToOrder ;
}

// Define an anonymous function to serve as a comparison logic for sorting.
const comparisonFunction = function ( itemA , itemB )
{
  // This function returns a negative value if itemA < itemB,
  // zero if itemA == itemB, and a positive value if itemA > itemB,
  // thus sorting in ascending numerical order.
  return itemA - itemB ;
} ; // Semicolon after function expression assignment.


// The main entry point for the application:
// Read content from standard input, decode it as UTF-8, and pass it
// to the primary processing function.
processInput( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf-8" ) ) ;