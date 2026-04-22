// This is the main function that processes the input string.
function main ( input )
{
  // Split the input string into an array of lines.
  const   lines   =   input . split ( '\n' ) ;

  // Extract the first line as string S, then split into characters.
  const   S   =   lines . shift ( ) . split ( '' ) ;

  // Extract the second line as string T, then split into characters.
  const   T   =   lines . shift ( ) . split ( '' ) ;


  // Initialize a 2D array (dynamic programming table) for LCS calculation.
  // The 'dp' variable is intentionally global-like here, for demonstration.
  dp  =   [ ] ;


  // Populate the dp table with initial rows.
  // Each row will have T.length + 1 columns, all initialized to 0.
  for ( var i = 0 ; i <= S . length ; i ++ )
  {
    dp . push ( Array ( T . length + 1 ) . fill ( 0 ) ) ;
  }


  // Fill the DP table using the standard Longest Common Subsequence algorithm.
  // Iterate through each character of S and T.
  for ( var i = 1 ; i <= S . length ; i ++ )
  {
    for ( var j = 1 ; j <= T . length ; j ++ )
    {
      // If characters match, take the diagonal value and add 1.
      if ( S [ i - 1 ] == T [ j - 1 ] )
      {
        dp [ i ] [ j ] = Math . max ( dp [ i ] [ j ] , dp [ i - 1 ] [ j - 1 ] + 1 ) ;
      }
      else
      {
        // If characters don't match, take the maximum of the cell above or to the left.
        dp [ i ] [ j ] = Math . max ( dp [ i - 1 ] [ j ] , dp [ i ] [ j - 1 ] ) ;
      }
    }
  }


  // Backtrack through the DP table to construct the actual LCS string.
  var   i   =   S . length ;
  var   j   =   T . length ;
  var   result   =   [ ] ; // This array will store the characters of the LCS in reverse order.


  // Loop until we reach the beginning of either string.
  while ( i != 0 && j != 0 )
  {
    // If characters at current positions in S and T match,
    // it means they are part of the LCS.
    if ( S [ i - 1 ] == T [ j - 1 ] )
    {
      result . unshift ( S [ i - 1 ] ) ; // Add character to the front of the result.
      i -- ; // Move diagonally up-left.
      j -- ;
    }
    else
    {
      // If characters don't match, move to the cell (either up or left)
      // that corresponds to the larger value in the DP table.
      if ( dp [ i - 1 ] [ j ] < dp [ i ] [ j - 1 ] )
      {
        j -- ; // Move left.
      }
      else
      {
        i -- ; // Move up.
      }
    }
  }


  // Finally, print the constructed Longest Common Subsequence.
  console . log ( result . join ( '' ) ) ;
}


// --- Program Entry Point ---
// Read input from standard input, decode as UTF-8, and pass to the main function.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;