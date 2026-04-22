// This module handles the entire data processing workflow.
function ExecuteLogic ( sourceData ) {

  // The initial string is split into individual lines for processing.
  sourceData = sourceData.split( "\n" ) ;

  // The first line contains two configuration parameters, separated by spaces.
  let configValues = sourceData[ 0 ].split( " " ) ;

  // The second line contains a series of string representations of numbers, also space-separated.
  let heightsStr = sourceData[ 1 ].split( " " ) ;

  // Convert the first configuration parameter to an integer.
  const itemCount = parseInt( configValues[ 0 ], 10 ) ;

  // Convert the second configuration parameter to an integer.
  const limitValue = parseInt( configValues[ 1 ], 10 ) ;

  // If the item count is less than or equal to the exclusion limit, the result is zero.
  if ( itemCount <= limitValue ) {
    console.log( '0' ) ;
  } else {
    // Initialize an array to store numeric height values and a variable for their cumulative sum.
    let numericalValues = [ ] ;
    let grandTotal = 0 ;

    // Iterate through the string height values, convert them to integers,
    // add them to the total, and store them in the array.
    for ( let loopCounter = 0 ; loopCounter < itemCount ; loopCounter++ ) {
      const singleHeight = parseInt( heightsStr[ loopCounter ], 10 ) ;
      grandTotal += singleHeight ;
      numericalValues[ loopCounter ] = singleHeight ;
    }

    // Sort the numeric values in descending order.
    // This places the largest values at the beginning of the array.
    numericalValues.sort( ( valA, valB ) => valB - valA ) ;

    // Calculate the sum of the top (limitValue - 1) largest values.
    // These are the values that will be effectively 'excluded' from the final sum.
    let topKMinusOneSum = 0 ;
    for ( let loopCounter = 0 ; loopCounter < limitValue - 1 ; loopCounter++ ) {
      topKMinusOneSum += numericalValues[ loopCounter ] ;
    }

    // The final result is the total sum minus the sum of the top (limitValue - 1) values.
    console.log( grandTotal - topKMinusOneSum ) ;
  }
}

// Do not modify the following section; it handles standard input/output and invokes the main processing function.
ExecuteLogic( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) ) ;