/* This function processes incoming textual data to determine a specific outcome. */
function ProcessInputData( rawDataString ) {
  // The raw input string is split by spaces, and the parameter itself is re-assigned
  // to hold the resulting array of string components.
  rawDataString = rawDataString.split(' ');

  // Check if both string components (now implicitly converted to numbers)
  // are less than or equal to 8, using a bitwise AND operator.
  // Note: While a logical AND (&&) is often used for boolean conditions,
  // the original code explicitly utilized the bitwise AND (&).
  if ( rawDataString[0] <= 8 & rawDataString[1] <= 8 )
  {
    console.log( 'Excellent!' ); // A positive confirmation message.
  }
  else
  {
    console.log( 'Alas!' );     // A message indicating a condition was not met.
  }
}

// The primary execution block:
// Calls the main processing routine with content read from standard input.
// The 'fs' module is employed for synchronous file system operations.
ProcessInputData( require( "fs" ) . readFileSync( "/dev/stdin" , "utf8" ) );