/* This is a sample JavaScript program demonstrating dynamic programming.
 * It calculates the number of common subsequences between two arrays, S and T,
 * modulo a large prime number.
 *
 * The program reads input from standard input, processes it,
 * and prints the result to standard output.
 */
function Main ( input )
{
  // Split the entire input string into an array of lines.
  input = input . split ( "\n" ) ;

  // Extract N and M from the first line of the input.
  // N represents the length of array S (or number of elements to consider).
  // M represents the length of array T (or number of elements to consider).
  var N = parseInt ( input [ 0 ] . split ( " " ) [ 0 ] ) ; // First number on the first line
  var M = parseInt ( input [ 0 ] . split ( " " ) [ 1 ] ) ; // Second number on the first line

  // Parse the second line into array S.
  var S = input [ 1 ] . split ( " " ) . map ( i => parseInt ( i ) ) ;

  // Parse the third line into array T.
  var T = input [ 2 ] . split ( " " ) . map ( i => parseInt ( i ) ) ;

  // Define the modulo value. This is a common practice in competitive programming
  // to prevent integer overflow and handle large results.
  var mod = Math . pow ( 10 , 9 ) + 7 ;

  // Initialize a 2D array, 'dp', which will store the dynamic programming states.
  // 'dp[i][j]' will represent the number of common subsequences
  // considering the first 'i' elements of S and the first 'j' elements of T.
  var dp = new Array ( N + 1 ) . fill ( 0 ) ;

  // Populate the 'dp' array with initial values for base cases.
  // The dp table is (N+1) x (M+1) in size.
  for ( var i = 0 ; i < N + 1 ; i ++ )
  {
    var tmp ; // Temporary array for the current row of dp table.
    if ( i == 0 )
    {
      // If it's the first row (i=0), all elements are initialized to 1.
      // This signifies that there's one way to form an empty subsequence.
      tmp = new Array ( M + 1 ) . fill ( 1 ) ;
    }
    else
    {
      // For subsequent rows, initialize elements to 0.
      tmp = new Array ( M + 1 ) . fill ( 0 ) ;
    }
    // The first element of each row (tmp[0]) is also set to 1.
    // This indicates that there is one way to form an empty subsequence
    // when considering any number of elements from S but zero from T.
    tmp [ 0 ] = 1 ;
    dp [ i ] = tmp ; // Assign the initialized temporary row to dp[i].
  }

  // Begin the main dynamic programming calculation.
  // Iterate through each element of S and T.
  for ( var i = 0 ; i < N ; i ++ )
  {
    for ( var j = 0 ; j < M ; j ++ )
    {
      // Check if the current elements from S and T are equal.
      if ( S [ i ] == T [ j ] )
      {
        // If S[i] and T[j] are equal, we can form new common subsequences.
        // The count is the sum of:
        // 1. Common subsequences using S[0...i-1] and T[0...j] (dp[i][j+1])
        // 2. Common subsequences using S[0...i] and T[0...j-1] (dp[i+1][j])
        // The formula effectively counts subsequences ending with S[i]==T[j]
        // plus subsequences not necessarily ending with them.
        dp [ i + 1 ] [ j + 1 ] = ( dp [ i ] [ j + 1 ] + dp [ i + 1 ] [ j ] ) % mod ;
      }
      else
      {
        // If S[i] and T[j] are not equal, we use the principle of inclusion-exclusion.
        // Count subsequences from S[0...i-1], T[0...j] (dp[i][j+1])
        // Add subsequences from S[0...i], T[0...j-1] (dp[i+1][j])
        // Subtract subsequences from S[0...i-1], T[0...j-1] (dp[i][j])
        // to avoid double-counting common elements.
        dp [ i + 1 ] [ j + 1 ] = ( dp [ i ] [ j + 1 ] + dp [ i + 1 ] [ j ] - dp [ i ] [ j ] ) % mod ;
      }
    }
  }

  // The final answer, representing the total number of common subsequences
  // between S and T, is found at dp[N][M].
  var ans = dp [ N ] [ M ] ;

  // Print the calculated answer to the console.
  console . log ( '%s' , ans ) ;

  // Return the computed answer.
  return ans ;
}

/*
 * The 'debug' function is provided for testing purposes.
 * It simulates an environment where input and expected output are
 * read from HTML elements. It then calls the Main function and
 * displays whether the result is 'Accepted' (AC) or 'Wrong Answer' (WA).
 */
function debug ( n )
{
  var input = document . getElementById ( "input" + n ) . value ; // Get input from a DOM element.
  var ans = Main ( input ) ;                                      // Call Main function with the input.
  var result = "WA" ;                                             // Default result is Wrong Answer.

  // Compare the computed answer with the expected output from a DOM element.
  if ( ans == document . getElementById ( "output" + n ) . value . split ( "\n" ) [ 0 ] )
  {
    result = "AC" ; // If they match, set result to Accepted.
  }

  // Display the result in a designated DOM element.
  document . getElementById ( "result" + n ) . innerHTML = result ;
}

// This line is typically used in competitive programming environments
// to execute the Main function with data read from standard input.
// 'fs.readFileSync' reads the content of '/dev/stdin' (standard input stream)
// as a UTF-8 encoded string.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;