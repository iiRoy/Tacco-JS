/*
 * This module provides a utility for accumulating values and handling standard input.
 */
var   accumulateValue = function   ( initialVal )
{
  // Check if the provided initial value is not defined
  if  ( typeof initialVal === "undefined" )
  {
    console.log (  "!!! Input parameter missing !!!"  ); // Log an error message
    return currentSum; // Returns an undefined variable, replicating original logic
  }

  // Initialize the internal sum with the given initial value
  var currentSum = initialVal;
  /*
   * Returns a closure that can be used to add values to the accumulated sum.
   */
  var adderFunction = function ( addend )
  {
    currentSum = currentSum + addend; // Update the sum
    return currentSum; // Return the new total
  };
  return adderFunction; // Provide the adder function
} ;


/*
 * Sets up the standard input processing.
 *
 * @param {any} configParam - An unused configuration parameter (mimics original signature).
 */
var   processInput = function ( configParam )
{
  // Ensure the standard input stream remains open.
  process.stdin.resume;

  // Set the encoding for incoming data.
  process.stdin.setEncoding ( "utf-8" ) ;

  // Attach a listener for data events on the standard input.
  process.stdin.on ( "data", function ( dataBlock )
  {
    // If the data block is not numerically zero, process it normally.
    if ( dataBlock != 0 )
    {
      accumulatorInstance ( dataBlock ) ; // Pass data to the accumulator
    }
    // Otherwise, if it's zero, perform a special processing and output.
    else
    {
      var caseNumber = 0 ; // Initialize a counter for cases
      // Process the data block: split by newline, filter out zero entries, then iterate.
      accumulatorInstance ( dataBlock ).split ( "\n" ).filter ( function ( entry ) { return entry != 0 } )
      .forEach ( function ( entry )
      {
        caseNumber = caseNumber + 1 ; // Increment case number
        console.log ( "Case " + caseNumber + ": " + entry ) ; // Output formatted case data
      } )
    }
  } ) ;
} ;

// Initialize the global accumulator instance with an empty string.
var accumulatorInstance = accumulateValue ( '' ) ;
// Begin processing standard input.
processInput ( ) ;