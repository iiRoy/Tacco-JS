'use strict'; /* Enforce strict parsing and error handling */

function ExecuteCalculation ( inputContent ) { // This function processes incoming text to find character mismatches
  const contentLines = inputContent . trim() . split ( /\r?\n/g ) ; // Split the raw input into an array of lines, removing leading/trailing whitespace

  const primaryStr = contentLines [ 0 ] ; // Extract the first string from the processed lines

  const secondaryStr = contentLines [ 1 ] ; // Extract the second string from the processed lines

  let differenceCounter = 0 ; // Initialize a counter for differing characters

  for ( let charIndex = 0 ; charIndex < primaryStr . length ; charIndex ++ ) { // Iterate through the characters of the primary string
    if ( primaryStr . charAt ( charIndex ) !== secondaryStr . charAt ( charIndex ) ) { // If characters at the current position do not match, increment the counter
      differenceCounter ++ ;
    }
  }

  console . log ( differenceCounter ) ; // Output the final count of differences
}

ExecuteCalculation ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ; // Invoke the main processing function with data read from standard input