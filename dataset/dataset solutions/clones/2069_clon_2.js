function processInputData( rawData )
{
  // Obtain the initial numerical component from the incoming data string.
  // This assumes the input is a sequence of numbers separated by spaces.
  var firstValue = parseInt( rawData.  trim() . split( " " )[ 0 ] ,    10  );

  // Extract the subsequent numerical component from the same raw input.
  // The parsing method remains consistent with the first extraction.
  var secondValue = parseInt( rawData. trim() . split( " " )[ 1 ] ,   10   );

  // Compute the final derived value based on specific logical conditions.
  // If either of the extracted values is unity, the output is unity.
  // Otherwise, the output is the ceiling of half their product.
  var finalOutcome = ( firstValue === 1 || secondValue === 1 ) ? 1 : Math.ceil( ( firstValue * secondValue ) / 2 );

  // Display the calculated final result to the standard output stream.
  console.log( finalOutcome );
}

// Invoke the primary data processing routine.
// This reads the entire content of the standard input device, encoded in UTF-8.
processInputData( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ) );