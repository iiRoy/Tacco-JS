"use strict" ; /* This directive enables strict mode for the entire script. */



function main ( input ) /* The main function processes the given input string. */
{
  // Split the input string by newlines to get individual lines.
  const inputs = input . split ( "\n" ) ;


  /* The first line of input represents the length 'L'. */
  const L = Number ( inputs [ 0 ] ) ;

  // Initialize an empty array 'A' to store the subsequent numbers.
  const A = [ ] ;

  /*
   * Loop through the input lines starting from the second line
   * up to 'L' lines, converting each to a number and pushing it into array A.
   */
  for
  (
    let i = 0 ; /* Initialize loop counter. */
    i < L ;     /* Loop condition: iterate 'L' times. */
    i ++        /* Increment loop counter. */
  )
  {
    // Convert the current input line to a number and add it to array A.
    A . push ( Number ( inputs [ i + 1 ] ) ) ;
  } /* End of the first data parsing loop. */


  /*
   * Initialize a 2D array 'dp' for dynamic programming.
   * It will have (L + 1) rows and 5 columns.
   * Each cell is initially undefined.
   */
  const dp = Array ( L + 1 ) . fill ( ) . map ( ( ) => Array ( 5 ) . fill ( ) ) ;

  /*
   * Set the base case for the DP table: dp[0] represents the state before processing any elements.
   * All initial costs are zero.
   */
  dp [ 0 ] = [ 0 , 0 , 0 , 0 , 0 ] ;

  /*
   * This is the core dynamic programming loop.
   * It iterates from the first element up to the 'L'-th element.
   */
  for
  (
    let i = 1 ; /* Start from the first element (index 1 in dp, index 0 in A). */
    i <= L ;    /* Iterate up to the L-th element. */
    i ++        /* Move to the next element. */
  )
  {
    /* Get the current element from array A. */
    let cur = A [ i - 1 ] ;

    /* Calculate 'curEven': cost if current element needs to be even.
     * If cur is 0, cost is 2 (special case for 0). Otherwise, cur % 2. */
    let curEven = A [ i - 1 ] === 0 ? 2 : cur % 2 ;

    /* Calculate 'curOdd': cost if current element needs to be odd. */
    let curOdd = ( cur + 1 ) % 2 ;


    /* DP state transitions: */

    // dp[i][0]: Cost to have 'i' elements, all in their original state.
    dp [ i ] [ 0 ] = dp [ i - 1 ] [ 0 ] + cur ;

    // dp[i][1]: Cost to have 'i' elements, with the last one being even.
    dp [ i ] [ 1 ] = Math . min ( dp [ i - 1 ] [ 0 ] , dp [ i - 1 ] [ 1 ] ) + curEven ;

    // dp[i][2]: Cost to have 'i' elements, with the last one being odd.
    dp [ i ] [ 2 ] = Math . min ( dp [ i - 1 ] [ 0 ] , dp [ i - 1 ] [ 1 ] , dp [ i - 1 ] [ 2 ] ) + curOdd ;

    // dp[i][3]: Cost to have 'i' elements, with the last two being even.
    dp [ i ] [ 3 ] = Math . min ( dp [ i - 1 ] [ 0 ] , dp [ i - 1 ] [ 1 ] , dp [ i - 1 ] [ 2 ] , dp [ i - 1 ] [ 3 ] ) + curEven ;

    // dp[i][4]: Cost to have 'i' elements, with the last two being even, and the one before that also even.
    dp [ i ] [ 4 ] = Math . min ( dp [ i - 1 ] [ 0 ] , dp [ i - 1 ] [ 1 ] , dp [ i - 1 ] [ 2 ] , dp [ i - 1 ] [ 3 ] , dp [ i - 1 ] [ 4 ] ) + cur ;
  } /* End of the main DP loop. */


  /*
   * After computing all DP states up to 'L', the minimum cost
   * for the entire sequence will be the minimum value in the last row of dp.
   */
  console . log ( Math . min ( ... dp [ L ] ) ) ;
} /* End of the main function definition. */


// Read input from standard input and pass it to the main function.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;
/* This line executes the program by reading from stdin. */