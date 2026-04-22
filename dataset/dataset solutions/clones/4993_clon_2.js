'use strict' ;

const   textElements = require ( "fs" ) . readFileSync ( "/dev/stdin" ,  "utf8" ) . split ( '' ) ;

let   outcomeString = "Affirmative" ; // Initialize the default result as positive.

for   ( let   mainIndex = 0 ;  mainIndex < textElements . length ;  mainIndex ++ )
{
  let   charTally = 0 ; // Counter to track how many times the current character appears.

  // Iterate through all characters to determine occurrences of the character at mainIndex.
  textElements . forEach ( comparedChar => {
    if   ( textElements [ mainIndex ]  ===  comparedChar )
      charTally ++ ;
  } ) ;

  // If the count for the current character is an odd number, the condition is not met.
  if   ( charTally % 2 !== 0 )
  {
    outcomeString = "Negative" ; // Update the result to negative.
    break ; // Exit the loop early as the condition is already violated.
  }
}

console . log ( outcomeString ) ;