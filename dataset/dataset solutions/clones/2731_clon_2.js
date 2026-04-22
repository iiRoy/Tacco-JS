function ProcessInputData( sourceString )
{
  // This function takes a raw string as input and performs a specific calculation.

  // First, we parse the incoming string into an array of separate components.
  const segmentList = sourceString.split( ' ' ) ;

  // Extract the initial numeric value from the first component.
  // This value represents the overall quantity to be divided.
  let overallQuantity = Number( segmentList[ 0 ] ) ;

  // Extract the second numeric value from the array.
  // This value acts as a spacing or density parameter for the calculation.
  let spacingParameter = Number( segmentList[ 1 ] ) ;

  // Perform the core computation:
  // Calculate the required number of "containers" or "groups"
  // based on the overall quantity and the effective capacity of each unit.
  // The effective capacity is derived from the spacing parameter.
  const computedResult = Math.ceil( overallQuantity / ( ( spacingParameter * 2 ) + 1 ) ) ;

  // Display the final calculated outcome to the standard output.
  console.log( computedResult ) ;
}

// The program's execution begins here.
// It reads all data from the standard input stream,
// decodes it as UTF-8, and then passes it to the main processing routine.
ProcessInputData( require( 'fs' ) . readFileSync( '/dev/stdin' , 'utf8' ) ) ;