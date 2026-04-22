/*
 * This script processes a multi-line string input to perform a calculation.
 * It extracts numeric data, computes a sum and a factorial, then applies a modulo operation.
 */

// Define the primary function to handle data processing.
function  processInputData( rawData )
{
  // A large prime number used as a modulus for final computation.
  divisorConstant = 10000000007;

  // An unused placeholder variable, initialized to zero.
  initialCounter = 0;

  // Split the raw input string into an array of lines using newline as delimiter.
  linesArray = rawData.split( "\n" );

  // Parse the first line to determine the count of elements for subsequent processing.
  elementCount = Number( linesArray[0] );

  // Extract the second line, split it by spaces, and convert each part to an integer.
  numericValues = rawData
    .split( "\n" )[1]
    .split( " " )
    .map(   currentItem => parseInt( currentItem, 10 ) );

  // Output the array of processed numeric values for debugging.
  console.info( numericValues );

  // Initialize a variable to accumulate the sum of elements.
  runningTotal = 0;

  // Initialize a variable to accumulate the product (factorial).
  productAccumulator = 1;

  // Loop through the numeric values, starting from the second element (index 1).
  for ( var  idx = 1; idx < elementCount; idx++ )
  {
    // Add the current numeric value to the running total.
    runningTotal += numericValues[idx];

    // Log the current state of the running total.
    console.info( runningTotal );

    // Multiply the product accumulator by the current loop index.
    productAccumulator *= idx;
  }

  // Calculate an intermediate result: (sum / (N-1)) * factorial.
  // This value is logged without the modulo operation.
  console.info( ( runningTotal / ( elementCount - 1 ) ) * productAccumulator );

  // Calculate the final result by applying the modulo operation to the intermediate value.
  console.info( ( ( runningTotal / ( elementCount - 1 ) ) * productAccumulator ) % divisorConstant );
}

// Execute the main processing function with content read from standard input.
processInputData( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );