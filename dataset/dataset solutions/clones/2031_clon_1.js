/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions are preserved exactly.
 * Only whitespace and comments have been altered significantly
 * to create a visually distinct but functionally identical version.
 */

function main ( input )
{
  // Parse the input string into an array of strings
  const inp  =  input.split(' ') ;

  /*
   * Convert string inputs to numbers.
   * n: total number of nodes
   * x: coordinate x
   * y: coordinate y
   */
  const n  =  Number( inp[0] ) ;
  const x  =  Number( inp[1] ) ;
  const y  =  Number( inp[2] ) ;


  /**
   * Calculates the distance between two nodes 'a' and 'b'.
   * The distance is either the direct path (b-a) or a path
   * involving nodes x and y (abs(x-a) + abs(y-b) + 1).
   * @param {number} a - The starting node.
   * @param {number} b - The ending node.
   * @returns {number} The minimum distance between 'a' and 'b'.
   */
  function dist ( a , b )
  {
    return Math.min( b - a , Math.abs( x - a ) + Math.abs( y - b ) + 1 ) ;
  }


  // Outer loop: Iterate through possible distances 'i'
  for ( var i = 1 ; i < n ; i ++ )
  {
    // Initialize a counter for the current distance 'i'
    var cnt  =  0 ;

    // Inner loop: Iterate through possible starting nodes 'a'
    // The loop runs up to n-i to ensure 's' (a+i) does not exceed 'n'
    for ( var a = 1 ; a <= n - i ; a ++ )
    {
      // Calculate the potential destination node 's' for direct path
      const s  =  a + i ;

      // Check if the direct path to 's' has length 'i'
      if ( s <= n  &&  dist( a , s ) === i )
      {
        cnt ++ ; // Increment count if direct path matches
      }

      // Calculate the remaining distance for paths involving (x,y)
      const rmn  =  i - 1 - Math.abs( x - a ) ;

      // Handle cases where rmn is positive (two distinct paths from y are possible)
      if ( rmn > 0 )
      {
        // Calculate 'prev' node: y - rmn
        const prev  =  y - rmn ;
        // Check if 'prev' is a valid destination and its distance is 'i'
        if ( prev !== s  &&  dist( a , prev ) === i )
        {
          cnt ++ ;
        }

        // Calculate 'next' node: y + rmn
        const next  =  y + rmn ;
        // Check if 'next' is a valid destination and its distance is 'i'
        if ( next !== s  &&  next <= n  &&  dist( a , next ) === i )
        {
          cnt ++ ;
        }
      }
      // Handle cases where rmn is zero (only one path from y is possible)
      else if ( rmn === 0  &&  y !== s  &&  dist( a , y ) === i )
      {
        cnt ++ ; // Increment count if path through 'y' matches
      }
    }

    // Output the total count for the current distance 'i'
    console.log( cnt ) ;
  }
}

// Main execution block: Reads input from stdin and calls the main function
main( require('fs').readFileSync( '/dev/stdin' , 'utf8' ) ) ;