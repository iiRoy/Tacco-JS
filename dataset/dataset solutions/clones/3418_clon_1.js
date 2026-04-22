function Main( input ) { /* This is the main function that processes the input string. */

  input = input . split ( "\n" ) ; /* Split the input string by newline characters into an array of lines. */

  var N = parseInt ( input [ 0 ] . split ( " " ) [ 0 ] ) ; // Parse the first number from the first line.
  var X = parseInt ( input [ 0 ] . split ( " " ) [ 1 ] ) ; // Parse the second number from the first line.

  bans = new Array ( 50 ) ; /* Initialize an array 'bans' with a size of 50. */
  all = new Array ( 50 ) ; // Initialize an array 'all' with a size of 50.

  bans [ 0 ] = 1 ; // Set the first element of 'bans' to 1.
  all [ 0 ] = 1 ; // Set the first element of 'all' to 1.

  var ans = 0 ; // Initialize the answer variable to 0.

  // Loop to precompute values for 'bans' and 'all' arrays up to index 50.
  for ( i = 1 ; i <= 50 ; i ++ ) {
    bans [ i ] = bans [ i - 1 ] * 2 + 1 ; /* Calculate the current 'bans' value based on the previous one. */
    all [ i ] = all [ i - 1 ] * 2 + 3 ;   // Calculate the current 'all' value based on the previous one.
  }

  var full = all [ N ] ; // Get the 'full' value corresponding to N.
  var bs = bans [ N ] ;  // Get the 'bs' value corresponding to N.

  /* This loop continues as long as X is greater than 0. */
  while ( X > 0 ) {

    // Check if X is greater than half of 'full' (minus 1).
    if ( X > ( full - 1 ) / 2 ) {
      X = X - ( full - 1 ) / 2 - 1 ; /* Adjust X by subtracting a portion. */
      ans = ans + ( bs - 1 ) / 2 + 1 ; // Add a calculated value to 'ans'.
      full = ( full - 1 ) / 2 - 1 ;    // Update 'full' for the next iteration.
      bs = ( bs - 1 ) / 2              // Update 'bs' for the next iteration.
    } else { /* If X is not greater than half of 'full'. */
      X = X - 1 ;                      // Decrement X by 1.
      full = ( full - 1 ) / 2 - 1 ;    // Update 'full' again.
      bs = ( bs - 1 ) / 2              // Update 'bs' again.
    }
  }
  console . log ( '%s' , ans ) ; // Print the final calculated answer to the console.
}


// Read input from standard input and pass it to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;