function calculateRemainder( rawInput ) {
  // This function aims to compute a specific remainder for a given numerical input.
  // Previous versions might have handled multi-line inputs, but this one focuses on a single value.
  // const parsedItems = rawInput.split('\n');

  let currentValue = Number( rawInput ) ; // Convert the provided string to a numerical representation.

  const divisorLimit = 1000 ; // Define the specific threshold for our modulo operation.

  while ( currentValue >= divisorLimit ) {
    currentValue %= divisorLimit ; // Continuously apply the modulo operation until the value is below the threshold.
  }

  console.log( currentValue ) ; // Display the final processed numerical result.

  // An alternative output expression that involved a conditional calculation was considered here.
  // console.log( ( currentValue === divisorLimit ) ? 0 : ( divisorLimit - currentValue ) );
}

// For local development, one might call the function with a hardcoded string, e.g., '3456'.
// calculateRemainder("3456");

calculateRemainder( require("fs").readFileSync("/dev/stdin", "utf8") ) ;