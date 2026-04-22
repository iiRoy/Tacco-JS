// This central procedure processes a given textual dataset.
function ProcessInput ( inputString ) {

  // Acquire the initial numerical datum from the input's first line, interpreting it as a monetary value.
  let itemCost = parseInt( inputString.split("\n")[0] ) ;

  // Fetch the subsequent numerical datum from the input's second line; this represents an acceptable deviation.
  let allowanceAmount = parseInt( inputString.split("\n")[1] ) ;

  // Evaluate if the modular result of the item's cost against 500 falls within the permissible allowance.
  // Consequently, a descriptive string is logged to the console.
  console.log( itemCost % 500 <= allowanceAmount ? "PositiveOutcome" : "NegativeOutcome" ) ;

}

// Execute the primary data handling routine, sourcing its input from the standard input stream.
// The 'fs' module facilitates reading file system content, here directed to '/dev/stdin'.
ProcessInput( require("fs").readFileSync("/dev/stdin", "utf8") ) ;