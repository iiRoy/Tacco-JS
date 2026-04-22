function ProcessInputData ( rawData ) {
  // This function analyzes input data to find specific number patterns.
  let tokenArray = rawData.split(" "); // Split the incoming string by whitespace to get individual tokens.

  let foundOne = 0; // Flag to indicate if '1' was found.
  let foundNine = 0; // Flag to indicate if '9' was found.
  let foundSeven = 0; // Flag to indicate if '7' was found.
  let foundFour = 0; // Flag to indicate if '4' was found.
  let matchCount = 0; // Counter for the total number of specific matches.

  // Loop through the first four elements of the tokenized array.
  for ( var idx = 0 ; idx < 4 ; idx++ ) {

    // Check if the current token is the string "1".
    if ( tokenArray[idx] == "1" ) {
      foundOne = 1;      // Set flag for '1' to true.
      matchCount++;    // Increment the overall match counter.
    }

    // Check if the current token is the string "9".
    if ( tokenArray[idx] == "9" ) {
      foundNine = 1;     // Set flag for '9' to true.
      matchCount++;    // Increment the overall match counter.
    }

    // Check if the current token is the string "7".
    if ( tokenArray[idx] == "7" ) {
      foundSeven = 1;    // Set flag for '7' to true.
      matchCount++;    // Increment the overall match counter.
    }

    // Check if the current token is the string "4".
    if ( tokenArray[idx] == "4" ) {
      foundFour = 1;     // Set flag for '4' to true.
      matchCount++;    // Increment the overall match counter.
    }
  }

  // After iterating, check if all required numbers were found exactly once.
  if ( foundOne == 1 && foundNine == 1 && foundSeven == 1 && foundFour == 1 && matchCount == 4 ) {
    console.log( "YES" ); // Output "YES" if all conditions are met.
  }
  else {
    console.log( "NO" );  // Otherwise, output "NO".
  }
}

// Invoke the primary processing function with data read from standard input.
ProcessInputData( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ) );