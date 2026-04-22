'use strict' ; /* Enforce strict mode for cleaner code practices. */


( function ( input ) {
  // Input processing section:
  // Normalize the input string by trimming whitespace and splitting into an array of numbers.
  input = input.trim ( )
               .split ( /\s+/ )
               .map ( x => x - 0 ) ;

  /*
   * The first element of the processed input array represents N,
   * the total number of slimes.
   */
  const N = input.shift ( ) ;

  // The remaining elements in the input array 'input' are the initial slime sizes.
  const a = input ;

  /*
   * Initialize a 2D array 'dp' for dynamic programming.
   * dp[i][j] will store the minimum cost to merge slimes from index 'j'
   * up to 'j + i' (inclusive).
   * It's initialized with Infinity to find the minimum values effectively.
   */
  const dp = new Array ( N ) .fill ( 0 ) .map ( ( x , i ) =>
    new Array ( N - i ) .fill ( Infinity )
  ) ;

  // Base case for dp: merging a single slime costs 0.
  // dp[0][j] represents merging a single slime (from j to j+0), which costs nothing.
  dp [ 0 ] = new Array ( N ) .fill ( 0 ) ;


  /*
   * Initialize a 2D array 'size'.
   * size[i][j] will store the total size of the merged slime
   * formed by combining slimes from index 'j' to 'j + i' (inclusive).
   */
  const size = new Array ( N ) .fill ( 0 ) .map ( ( x , i ) =>
    new Array ( N - i ) .fill ( 0 )
  ) ;

  // Base case for size: the size of a single slime (i=0) is its initial value.
  size [ 0 ] = a ;

  // Pre-calculate cumulative sizes for all possible ranges.
  // This loop computes `size[i][j]` which is the sum of `a[j]` through `a[j+i]`.
  for ( let i = 1 ; i < N ; i ++ )
  {
    for ( let j = 0 ; j < N - i ; j ++ )
    {
      // The size of merging slimes from j to j+i is the sum of
      // the size of slimes from j to j+i-1 and the size of slime at j+i.
      size [ i ] [ j ] = size [ i - 1 ] [ j ] + size [ 0 ] [ j + i ] ;
    }
  }


  // Main dynamic programming loop to calculate minimum merge costs.
  // 'i' represents the length of the slime segment being considered (length - 1).
  for ( let i = 1 ; i < N ; i ++ ) {

    // 'j' represents the starting index of the slime segment.
    for ( let j = 0 ; j < N - i ; j ++ ) {

      // 'k' represents the split point within the segment [j, j+i].
      // We are trying all possible ways to split the current segment into two sub-segments.
      for ( let k = 0 ; k < i ; k ++ ) {

        /*
         * Calculate the cost of merging two sub-segments:
         * 1. Slimes from index 'j' to 'j + k' (length k+1).
         * 2. Slimes from index 'j + k + 1' to 'j + i' (length i - k).
         *
         * The total cost is the sum of:
         *   - Cost to merge the first sub-segment (dp[k][j])
         *   - Cost to merge the second sub-segment (dp[i - k - 1][j + k + 1])
         *   - Cost to merge the resulting two large slimes (which is their combined size).
         *     The combined size is size[k][j] + size[i - k - 1][j + k + 1].
         */
        dp [ i ] [ j ] = Math . min (
          dp [ i ] [ j ] ,
          dp [ k ] [ j ] + dp [ i - k - 1 ] [ j + k + 1 ] + size [ k ] [ j ] + size [ i - k - 1 ] [ j + k + 1 ]
        ) ;
      }
    }
  }

  // Debugging lines (commented out in production):
  // console.log ( size ) ;
  // console.log ( dp ) ;

  // The final answer is the minimum cost to merge all slimes (from index 0 to N-1).
  console.log ( dp [ N - 1 ] [ 0 ] ) ;

} ) (
  require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' )
) ;