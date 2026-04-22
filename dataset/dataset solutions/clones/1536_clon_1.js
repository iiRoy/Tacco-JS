/*
 * This is a Type I clone of an original JavaScript program.
 * It maintains exact structural and logical equivalence.
 * Only whitespace and comments have been altered significantly.
 */
const main = ( input ) => {
  // Define a constant for the modulo operation.
  const mod   =   ( 10 ** 9   +   7 ) ;

  // Parse the input string to an integer, after trimming whitespace.
  const s =   Number( input . trim() ) ;

  /*
   * Initialize a dynamic programming array 'dp'.
   * The first element is 1, and the rest are filled with 0s up to 's' elements.
   * This setup is crucial for the DP state transitions.
   */
  const dp =    [ 1 ,   ... new   Array( s ) . fill( 0 ) ] ;


  // Iterate through the dp array starting from index 3.
  for    ( let   x = 3 ;   x < dp . length ;   x ++ )
  {
    // Initialize a sum for the current dp[x] calculation.
    let   sum   =   0 ;

    // Inner loop to calculate the sum of previous dp states.
    for   ( let   i = x - 3 ;   i >= 0 ;   i -- )
    {
      // Accumulate sum, ensuring it stays within the modulo range.
      sum =   ( sum   +   dp[ i ] )   %   mod   ;
    }

    // Assign the calculated sum to the current dp state.
    dp [ x ]   =   sum ;
  }


  // Output the final result to the console.
  // The expression ensures a positive result even if dp[s] is negative (though unlikely here).
  return console . log ( ( dp [ s ]   %   mod   +   mod )   %   mod ) ;
} ; // End of the main function.

// Conditional execution based on environment variables.
// This part handles different execution environments (e.g., testing or standard input).
process . env . MYTEST
  ?   ( process . env . MYTEST   ===   'test'   ?   test ( )
                                                 :   main ( require ( 'fs' ) . readFileSync ( 'dev/stdin' ,   'utf8' ) ) )
  :   main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ) ;

// End of file.