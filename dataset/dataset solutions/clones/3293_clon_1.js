// This is the main function that solves the problem.
function   Main ( s )
{
  /*
   * The input 's' is initially a single string.
   * We split it by newline characters to get an array of lines.
   */
  var   s   =   s.split ( "\n" ) ;


  // Parse n and k from the first line of input.
  // Note: The `*1` is a common trick to convert string to number.
  var   n   =   s[0].split ( " " )[0]*1  ,
        k   =   s[0].split ( " " )[1]*1 ;

  // Parse the heights 'h' from the second line.
  // Each element is converted to a number.
  var   h   =   s[1].split ( " " ).map ( e => e*1 ) ;

  // Initialize a dynamic programming array 'dp'.
  // All elements are initially set to Infinity.
  var   dp   =   new   Array ( n ).fill ( Infinity ) ;

  // The cost to reach the first stone (index 0) is 0.
  dp[0]   =   0 ;


  // This is the main DP loop.
  // It iterates from the second stone up to the last stone.
  for   ( var   i   =   1 ;   i   <   n ;   i++   )
  {
      // Inner loop: considers possible previous stones 'j'.
      // A frog can jump from 'j' to 'i' if 'j' is within 'k' distance from 'i'.
      for   ( var   j   =   i   -   1 ;   j   >=   i   -   k ;   j--   )
      {
          // Calculate the minimum cost to reach stone 'i'.
          // It's the minimum of the current cost to 'i'
          // and the cost to 'j' plus the absolute height difference between 'j' and 'i'.
          dp[i]   =   Math.min ( dp[i] ,   dp[j]   +   Math.abs ( h[j]   -   h[i] ) ) ;

          // If 'j' is 0, we can break early because we can't go back further.
          if   ( j   ===   0 )
          {
              break ;
          }
      }
  }

  // After computing all minimum costs, the answer is the cost to reach the last stone.
  console.log ( dp[dp.length   -   1] ) ;
}

// Call the Main function with input read from standard input.
Main ( require ( "fs" ).readFileSync ( "/dev/stdin" ,   "utf8" ) ) ;