/*
 * This is the main function that processes the input argument.
 * It calculates the length of the longest common substring between a string and itself,
 * which is effectively finding the longest repeating substring.
 *
 * The input 'arg' is expected to be a string containing two lines.
 */
function Main ( arg )
{
  // First, we parse the input string 'arg'.
  // The input is expected to have two lines:
  // The first line contains an integer N, representing the length of the string.
  // The second line contains the string S itself.

  // Extract N from the first line and convert it to a number.
  // arg.split("\n")[0] gets the first line.
  // The '- 0' at the end is a common JavaScript idiom to explicitly convert a string to a number.
  var N = arg . split ( "\n" ) [ 0 ] - 0 ;


  // Extract S from the second line.
  // arg.split("\n")[1] gets the second line, which is our target string.
  var S = arg . split ( "\n" ) [ 1 ] ; // S is the input string for which we're finding the longest repeating substring.


  // Initialize a 2D array, 'dp', which will store dynamic programming results.
  // The 'dp' table will help us keep track of the lengths of common substrings.
  // The outer array is initialized with 'N' elements, representing 'N' rows.
  var dp = new Array ( N ) ;

  // Initialize each row of the dp array.
  // Each row will have N + 1 columns.
  // The last column (index N) is initialized to 0 for convenience,
  // acting as a boundary condition for our DP calculations.
  for ( var i = 0 ; i < N ; i ++ )
  {
    // Create a new array for the current row 'i' with N + 1 columns.
    dp [ i ] = new Array ( N + 1 ) ;

    // Set the last element of the current row to 0.
    // This is a crucial initialization step for the DP algorithm.
    dp [ i ] [ N ] = 0 ;
  }


  // This loop initializes the last row (N-1) of the dp table.
  // It iterates backwards from N-1 down to 0 for column 'j'.
  // This loop handles the base cases for the DP.
  for ( var j = N - 1 ; j >= 0 ; j -- )
  {
    // If 'j' is the same as the row index (N-1),
    // it means we are at the main diagonal for the last row.
    // A substring starting and ending at the same position has length 0 for our purpose.
    if ( j === N - 1 )
    {
      dp [ N - 1 ] [ j ] = 0 ; // Set the value to 0.
      continue ; // Move to the next iteration for column 'j'.
    }

    // Compare characters at S[N-1] and S[j].
    // If they are equal, it means there's a common character.
    // This is checking if the last character of the string matches another character 'j'.
    if ( S [ N - 1 ] === S [ j ] )
    {
      dp [ N - 1 ] [ j ] = 1 ; // Set the value to 1, indicating a match of length 1.
    }
    // If the characters are not equal.
    else
    {
      dp [ N - 1 ] [ j ] = 0 ; // Set the value to 0, indicating no match at this position.
    }
  }


  // This section fills the rest of the dp table using dynamic programming.
  // It iterates from the second-to-last row (N-2) up to the first row (0).
  // This is the core logic for calculating the longest repeating substring.
  for ( var i = N - 2 ; i >= 0 ; i -- )
  {
    // For each row 'i', it iterates columns 'j' from N-1 down to 0.
    // This ensures that dp[i+1][j+1] is already computed when needed.
    for ( var j = N - 1 ; j >= 0 ; j -- )
    {
      // If 'i' and 'j' are the same, it means we are on the main diagonal.
      // A repeating substring cannot start at the same index in both comparisons.
      if ( i === j )
      {
        dp [ i ] [ j ] = 0 ; // Set the value to 0, as it's not a valid repeating substring.
        continue ; // Move to the next iteration for column 'j'.
      }

      // Compare characters at S[i] and S[j].
      // If they are equal, it means we have a potential match for a repeating substring.
      if ( S [ i ] === S [ j ] )
      {
        // If characters match, the length of the common substring at (i, j) is 1
        // plus the length of the common substring of the remaining parts (S[i+1] and S[j+1]).
        // This value is retrieved from dp[i+1][j+1].
        dp [ i ] [ j ] = dp [ i + 1 ] [ j + 1 ] + 1 ;
      }
      // If the characters do not match.
      else
      {
        // If characters don't match, the common substring length starting at (i, j) is 0.
        dp [ i ] [ j ] = 0 ;
      }
    }
  }

  // Flatten the 2D dp array into a 1D array 'ary2'.
  // This is done to easily find the maximum value across all cells in the dp table.
  // Array.prototype.concat.apply([], dp) effectively flattens the array of arrays.
  var ary2 = Array . prototype . concat . apply ( [ ] , dp ) ;

  // Find the maximum value in the flattened array 'ary2'.
  // This maximum value represents the length of the longest repeating substring found.
  // Math.max.apply(null, ary2) is used to find the maximum in an array.
  var max = Math . max . apply ( null , ary2 ) ;

  // Output the maximum length to the console.
  console . log ( max ) ;
}


// Call the Main function with input read from /dev/stdin.
// The 'require("fs")' statement imports the Node.js file system module.
// 'readFileSync("/dev/stdin", "utf8")' reads the entire content of the standard input
// synchronously and decodes it as a UTF-8 string.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;