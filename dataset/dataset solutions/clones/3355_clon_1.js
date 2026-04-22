/*
 * This JavaScript code defines a primary function 'Main'
 * to process input data for a dynamic programming problem.
 * It also includes a 'debug' function for testing purposes.
 *
 * The 'Main' function calculates an optimal value based on
 * given height and value arrays.
 */

function Main ( input ) /* The main entry point for processing the input */ {

  // First, parse the input string into an array of lines.
  input = input . split ( "\n" ) ;

  // Extract the first integer, N, which often represents the size of the problem.
  var N = parseInt ( input [ 0 ] ) ;

  // Process the second line to get an array of heights 'h'.
  // It splits the string by spaces and converts each part to an integer.
  var h = input [ 1 ] . split ( " " ) . map ( i => parseInt ( i ) ) ;

  // Similarly, process the third line to get an array of values 'a'.
  var a = input [ 2 ] . split ( " " ) . map ( i => parseInt ( i ) ) ;


  // Initialize a dynamic programming array 'dp' of size N+1 with all zeros.
  // This array will store maximum values achievable at different states.
  var dp = new Array ( N + 1 ) . fill ( 0 ) ;

  // The original problem might have used dp[h[0]] = a[0] for initialization,
  // but it's currently commented out.
  // dp [ h [ 0 ] ] = a [ 0 ] ;

  // Initialize the variable 'ans' to store the final maximum answer found.
  var ans = 0 ;


  // This is the main loop, iterating through each element from 0 to N-1.
  for ( var i = 0 ; i < N ; i ++ ) {

    // 'max' is declared but not used in the current logic.
    var max = 0 ;

    // Calculate a temporary value 'tmp' by adding the current 'a[i]'
    // to the value stored in 'dp' at the height 'h[i]'.
    tmp = a [ i ] + dp [ h [ i ] ] ;

    // This inner loop iterates from the current height 'h[i]' up to N.
    // It's designed to propagate the 'tmp' value to subsequent states
    // in the 'dp' array, but only if 'tmp' is greater.
    for ( var j = h [ i ] ; j < N + 1 ; j ++ ) {

      // If the calculated 'tmp' value is greater than the current 'dp[j]',
      // update 'dp[j]' with 'tmp'.
      if ( tmp > dp [ j ] ) {

        dp [ j ] = tmp ;

      } else {
        // If 'tmp' is not greater, it means further states 'j'
        // will also not be improved by 'tmp', so we can break early.
        break ;
      }

    } // End of inner loop for 'j'

    // Update the overall maximum answer found so far.
    // This takes the maximum between the current 'ans' and the
    // value in 'dp' at the current height 'h[i]'.
    ans = Math . max ( ans , dp [ h [ i ] ] ) ;

  } // End of outer loop for 'i'


  // Output the final calculated answer to the console.
  console . log ( '%s' , ans ) ;

  // Return the computed answer.
  return ans ;

} // End of Main function


// This is a helper function typically used for debugging or testing within a web environment.
// It simulates button clicks or specific test cases.
/*
 * Function: debug(n)
 * Purpose: Simulates a test run for a given test case 'n',
 *          compares the Main function's output to an expected output,
 *          and updates a result display (AC for Accepted, WA for Wrong Answer).
 */
function debug ( n ) {

  // Retrieve the input value for the specified test case 'n' from an HTML element.
  var input = document . getElementById ( "input" + n ) . value ;

  // Execute the Main function with the retrieved input.
  var ans = Main ( input ) ;

  // Initialize the result string to "WA" (Wrong Answer).
  var result = "WA" ;

  // Compare the computed answer 'ans' with the expected output from another HTML element.
  if ( ans == document . getElementById ( "output" + n ) . value . split ( "\n" ) [ 0 ] ) {

    // If they match, set the result to "AC" (Accepted).
    result = "AC" ;

  }

  // Update the HTML element displaying the result for test case 'n'.
  document . getElementById ( "result" + n ) . innerHTML = result ;

} // End of debug function


// This line is typically used in Node.js environments to read input from standard input
// and then pass it to the Main function for processing.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;