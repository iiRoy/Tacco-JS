"use strict" /* Ensure strict mode for clean code. */
function ProcessInputData( sourceText )
{
  // Parse the raw input string into separate lines.
  const parsedLines = sourceText . trim ( ) . split ( '\n' ) ;

  // Extract numerical values from the parsed input lines.
  const numFiveHundredYenCoins = Number ( parsedLines [ 0 ] ) ;
  const numOneHundredYenCoins = Number ( parsedLines [ 1 ] ) ;
  const numFiftyYenCoins = Number ( parsedLines [ 2 ] ) ;
  const targetAmount = Number ( parsedLines [ 3 ] ) ;

  // Initialize a counter for valid combinations.
  let validCombinationCount = 0 ;

  // Iterate through all possible counts for 500-yen coins.
  for ( let count500 = 0 ; count500 <= numFiveHundredYenCoins ; ++ count500 )
  {
    // Iterate through all possible counts for 100-yen coins.
    for ( let count100 = 0 ; count100 <= numOneHundredYenCoins ; ++ count100 )
    {
      // Iterate through all possible counts for 50-yen coins.
      for ( let count50 = 0 ; count50 <= numFiftyYenCoins ; ++ count50 )
      {
        // Calculate the current total value.
        let currentTotal = ( 500 * count500 ) + ( 100 * count100 ) + ( 50 * count50 ) ;
        
        // Check if the current total matches the desired target amount.
        if ( targetAmount === currentTotal )
        {
          validCombinationCount ++ ; // Increment the counter if it matches.
        }
      } // End of inner loop for 50-yen coins.
    } // End of middle loop for 100-yen coins.
  } // End of outer loop for 500-yen coins.

  // Output the final count of valid combinations.
  console.log ( validCombinationCount ) ;
}

// Read input from standard input and pass it to the processing function.
ProcessInputData ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;