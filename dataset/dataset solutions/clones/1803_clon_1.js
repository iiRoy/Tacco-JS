"use strict" ; /* This directive enforces strict mode for the entire script.
                                  It helps in writing cleaner code and catching common errors. */

/*
 * This 'main' function serves as the entry point for processing the input.
 * It takes a single argument, 'arg', which is expected to be a string
 * containing multiple lines of data representing various test cases.
 */
function main ( arg ) {

  // Prepare the input: trim whitespace and split the string into an array of lines.
  let input = arg . trim ( ) . split ( "\n" ) ;

  // Extract the first line, which indicates the total number of test cases (T).
  // The 'shift()' method removes the first element from the 'input' array.
  const T = input . shift ( ) ;


  // Loop through each test case, from t = 0 up to T-1.
  for ( let t = 0 ; t < T ; t ++ ) {

    // Retrieve the data specific to the current test case.
    // The input lines are grouped in threes: N, A, and S.
    const N = input [ 0 + t * 3 ] ; // N represents the number of vertices for the current test case.
    const A = input [ 1 + t * 3 ] . split ( " " ) . map ( a => Number ( a ) ) ; // A is an array of numbers, parsed from a space-separated string.
    const S = input [ 2 + t * 3 ] ; // S is a string of '0's and '1's, acting as control signals.

    // Initialize a variable 'x' to 0 for accumulating results for the current test case.
    let x = 0 ;

    /*
     * Iterate over each character in the string 'S'.
     * 's' is the current character (signal), and 'i' is its index.
     * The 'toString()' and 'split("")' ensure we iterate over characters.
     */
    S . toString ( ) . split ( "" ) . forEach ( ( s , i ) => {

      // Calculate the number of set bits (1s) in 'x' if it were XORed with A[i].
      // This is a potential new state for 'x'.
      let newX_count1 = ( x ^ A [ i ] ) . toString ( 2 ) . split ( "" ) . filter ( x => x == 1 ) . length ;

      // Calculate the current number of set bits (1s) in 'x'.
      let x_count1 = x . toString ( 2 ) . split ( "" ) . filter ( x => x == 1 ) . length ;

      // Provide detailed console output for debugging and tracing the execution flow.
      console . log ( `S${ s } will do..` ) ;
      console . log ( `  1 count for new = ${ newX_count1 }, or ${ x ^ A [ i ] }` ) ;
      console . log ( `  1 count for old = ${ x_count1 }, or ${ x }` ) ;

      // Conditional logic based on the value of the control signal 's'.
      if ( s == 0 ) {
        // If 's' is '0', the rule is: do nothing if the new state has MORE 1s than the old state.
        // Otherwise, update 'x' by XORing it with A[i].
        if ( newX_count1 > x_count1 ) {
          // If the new value of 'x' (x^A[i]) would have more set bits, we skip the update.
        } else {
          // If the new value has fewer or equal set bits, we perform the XOR operation.
          x = x ^ A [ i ] ;
        }
      } else {
        // If 's' is '1', the rule is: update 'x' by XORing it with A[i] if the new state has MORE 1s.
        // Otherwise, do nothing.
        if ( newX_count1 > x_count1 ) {
          // If the new value of 'x' (x^A[i]) would have more set bits, we perform the update.
          x = x ^ A [ i ] ;
        } else {
          // If the new value has fewer or equal set bits, we skip the update.
        }
      }
    } ) ; // End of the forEach loop over characters in 'S'.

    // After processing all control signals for the current test case,
    // output '1' if 'x' is non-zero, otherwise output '0'.
    console . log ( `${ x ? "1" : "0" }` ) ;
  } // End of the loop iterating through test cases.
} // End of the 'main' function.


/*
 * This line executes the 'main' function.
 * It reads the entire content of '/dev/stdin' (standard input) as a UTF-8 string.
 * This is a common pattern for competitive programming environments in JavaScript.
 * The commented-out line below provides an example of how to call 'main' with
 * hardcoded test data for local development and testing purposes.
 */
// main ( "2\n2\n1 2\n10\n2\n1 1\n10" ) ;
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;