"use strict"

// This module processes an input string to check for adjacent identical characters.

const processInput = ( inputString ) => {
  // Convert the incoming string into an array of individual characters.
  let digitArray = inputString . split ( "" ) ;

  // Initialize a status message, assuming a good condition by default.
  let resultStatus = "Positive" ;

  // Iterate through the character array, checking for adjacent pairs.
  for ( let idx = 0 ; idx < 3 ; idx ++ )
  {
    // If a character is identical to the one immediately following it,
    // update the status to indicate a negative condition.
    if ( digitArray [ idx ] === digitArray [ idx + 1 ] )
    {
      resultStatus = "Negative" ;
    }
  }

  // Output the final determined status to the console.
  console . log ( resultStatus ) ;
}

// Read the input from standard input and pass it to the processing function.
processInput ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;