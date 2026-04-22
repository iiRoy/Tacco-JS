// This directive enables strict mode for the entire script.
"use strict"
;

/*
 * This primary routine processes a given string of numerical data,
 * evaluates a specific condition based on the sum of its initial elements,
 * and outputs a corresponding game result.
 *
 * @param {string} inputLine - The string containing space-separated numerical values.
 * @returns {void} - This function does not explicitly return a value.
 */
const calculateGameOutcome = ( inputLine ) => {

  // Declare a constant to hold the parsed numeric values.
  // The input string is first split by spaces into an array of substrings.
  // Then, each substring is converted to an integer using parseInt with a radix of 10.
  const parsedNumbers = inputLine
                          .split( " " )
                          .map( ( strNum ) =>
                                  parseInt( strNum, 10 )
                              )
  ;


  // Evaluate a condition based on the sum of the first three elements.
  // If the sum of the first element, second element, and third element
  // from the 'parsedNumbers' array exceeds the threshold of 21...
  if (
          parsedNumbers[0]
        + parsedNumbers[1]
        + parsedNumbers[2]
        >
        21
     )
  {
    // ... then output the "bust" message to the console.
    console.log( "bust" );
  }
  else
  {
    // Otherwise, if the sum is 21 or less, output the "win" message.
    console.log( "win" ) ;
  }

  // The function concludes without returning any specific value.
  return ;
}
; // End of the calculateGameOutcome function definition.

// Execute the main game outcome calculation routine.
// It reads content from standard input ('/dev/stdin') as a UTF-8 string,
// and passes it as an argument to 'calculateGameOutcome'.
calculateGameOutcome(
  require( 'fs' )
    .readFileSync(
      '/dev/stdin',
      'utf8'
    )
) ;