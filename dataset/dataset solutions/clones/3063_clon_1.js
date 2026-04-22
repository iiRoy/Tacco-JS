/* This JavaScript file enforces strict parsing and execution rules. */
"use strict" ;

// Define the main function to process input.
const main = ( arg ) =>
{
  // Split the input string by newline characters into an array of strings.
  arg = arg . split ( "\n" ) ;

  /*
   * The following line was an alternative way to get 'k' but is currently
   * commented out. It would have parsed an element from a slice of 'arg'.
   * const kValueFromSlice = parseInt ( arg . slice ( 5 , 6 ) ) ;
   */

  // Extract the last element from the 'arg' array and parse it as an integer for 'k'.
  const k = parseInt ( arg . pop ( ) ) ;

  // Map the remaining elements of 'arg' to an array of integers, representing antenna values.
  const antennas = arg . map ( n => parseInt ( n ) ) ;


  // Check the condition: if the difference between the 5th and 1st antenna is greater than k,
  // log ":(", otherwise log "Yay!". This uses a ternary operator for concise output.
  console . log ( antennas [ 4 ] - antennas [ 0 ] > k ? ":(" : "Yay!" ) ;

  /*
   * The block below contains commented-out code for an alternative logic
   * which would iterate through all pairs of antennas to check the condition.
   * This logic is currently not used in the program's execution flow.
   */
  // Original iterative logic (commented out):
  // for ( let i = 0 ; i < antennas . length ; i ++ )
  // {
  //   for ( let j = i + 1 ; j < antennas . length ; j ++ )
  //   {
  //     if ( antennas [ j ] - antennas [ i ] > k )
  //     // If the difference exceeds 'k', then it's an issue.
  //     {
  //       console . log ( ":(" ) ;
  //       return ; // Exit the function early if condition is met
  //     }
  //   }
  // }
  // If no pair met the condition, then log "Yay!".
  // console . log ( "Yay!" ) ;
} ;

// Execute the main function with input read from standard input.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;