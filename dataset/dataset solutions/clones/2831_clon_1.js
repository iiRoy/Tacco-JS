/*
 * This is a JavaScript program designed to solve a dynamic programming problem.
 * The 'Main' function processes input, calculates a result, and prints it.
 * The 'debug' function is for local testing purposes, comparing output to expected values.
 */

function   Main  (  input  )

{

  // First, split the entire input string by newline characters.
  input = input.split ( "\n" ) ;

  // Parse the first line of input to get N and M.
  // N is the first number on the first line.
  var N = parseInt ( input [ 0 ] . split ( " " ) [ 0 ] ) ;
  // M is the second number on the first line.
  var M = parseInt ( input [ 0 ] . split ( " " ) [ 1 ] ) ;

  // Parse the second line of input into an array of integers, S.
  var S = input [ 1 ] . split ( " " ) . map ( i => parseInt ( i ) ) ;

  // Parse the third line of input into an array of integers, T.
  var T = input [ 2 ] . split ( " " ) . map ( i => parseInt ( i ) ) ;

  // Define the modulo constant, often used in dynamic programming problems
  // to prevent integer overflow. It's 10^9 + 7.
  var mod = Math . pow ( 10 , 9 ) + 7 ;

  // Initialize a 2D DP array.
  // dp[i][j] will store the number of common subsequences using
  // the first 'i' elements of S and the first 'j' elements of T.
  var dp = new Array ( N + 1 ) . fill ( 0 ) ;

  // Initialize a 'sum' array, though it appears to be unused in the final logic.
  // This might be a remnant from a previous approach or a placeholder.
  var sum = new Array ( N + 1 ) . fill ( 0 ) ;

  // Dynamically create the 2D structure for the dp array.
  // Each element dp[i] will be an array of size M+1, initialized to zeros.
  for ( var i = 0 ; i < N + 1 ; i ++ )
  {
    var tmp = new Array ( M + 1 ) . fill ( 0 ) ; // Create a new row.
    dp [ i ] = tmp ;                              // Assign the row to dp[i].
  }


  // Fill the dp table using nested loops.
  // i iterates through elements of S (from 0 to N-1)
  // j iterates through elements of T (from 0 to M-1)
  for ( var i = 0 ; i < N ; i ++ )
  {
    for ( var j = 0 ; j < M ; j ++ )
    {
      // Case 1: If the current elements S[i] and T[j] are equal.
      if ( S [ i ] == T [ j ] )
      {
        // The number of common subsequences ending with S[i] (and T[j])
        // is the sum of:
        // 1. common subsequences using S[0...i-1] and T[0...j] (dp[i][j+1])
        // 2. common subsequences using S[0...i] and T[0...j-1] (dp[i+1][j])
        // 3. PLUS 1 for the new common subsequence formed by S[i] and T[j] themselves.
        // We take modulo 'mod' at each step to prevent overflow.
        dp [ i + 1 ] [ j + 1 ] = ( dp [ i ] [ j + 1 ] + dp [ i + 1 ] [ j ] + 1 ) % mod ;
      }
      // Case 2: If the current elements S[i] and T[j] are not equal.
      else
      {
        // The number of common subsequences is the sum of:
        // 1. common subsequences using S[0...i-1] and T[0...j] (dp[i][j+1])
        // 2. common subsequences using S[0...i] and T[0...j-1] (dp[i+1][j])
        // 3. MINUS common subsequences using S[0...i-1] and T[0...j-1] (dp[i][j])
        //    because these were double counted in the sum of the first two terms.
        // We add 'mod' before subtracting dp[i][j] to ensure the result is
        // always positive before taking the final modulo.
        dp [ i + 1 ] [ j + 1 ] = ( dp [ i ] [ j + 1 ] + dp [ i + 1 ] [ j ] + ( mod - dp [ i ] [ j ] ) ) % mod ;
      }
    }
  }

  // The final answer is dp[N][M] (total common subsequences) + 1 (for the empty subsequence).
  var ans = dp [ N ] [ M ] + 1 ;

  // Output the calculated answer to the console.
  console . log ( '%s' , ans ) ;

  // Return the answer.
  return ans ;
}


/**
 * The 'debug' function is a utility for local testing environments.
 * It reads input from a specified HTML element, calls the Main function,
 * and compares the result against an expected output from another HTML element.
 * It then updates a third HTML element with "AC" (Accepted) or "WA" (Wrong Answer).
 *
 * @param {number} n - An identifier for the input/output elements (e.g., "input1", "output1").
 */
function     debug    (    n    )

{
  // Get the input string from the HTML element with ID "input" + n.
  var input = document . getElementById ( "input" + n ) . value ;

  // Call the main processing function with the retrieved input.
  var ans = Main ( input ) ;

  // Initialize the result status to "WA" (Wrong Answer).
  var result = "WA" ;

  // Compare the computed answer with the expected output.
  // The expected output is taken from the HTML element "output" + n,
  // split by newlines, and only the first line is considered.
  if ( ans == document . getElementById ( "output" + n ) . value . split ( "\n" ) [ 0 ] )
  {
    // If the answers match, set the result to "AC" (Accepted).
    result = "AC" ;
  }

  // Update the inner HTML of the element "result" + n with the final status.
  document . get ElementById ( "result" + n ) . innerHTML = result ;
}


// This line is the entry point for execution when run in a Node.js environment.
// It reads the entire content of standard input synchronously, using UTF-8 encoding,
// and passes it to the 'Main' function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;