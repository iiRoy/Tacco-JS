/*
 * This script processes input data to find the maximum sum of candies.
 * It's a slightly modified version of the original, focusing on
 * whitespace and comments for Type I cloning.
 */
function Main ( input ) {
  // Parse the input string into an array of settings.
  const setting= input . trim ( ) . split ( '\n' ) ;

  /*
   * The first element represents the total number of processes.
   * We subtract 0 to ensure it's treated as a number.
   */
  const process_sum = setting [ 0 ] - 0 ;

  // The second element contains 'up' values, split by spaces.
  const up = setting [ 1 ] . split ( ' ' ) ;

  // The third element contains 'down' values, also split by spaces.
  const down = setting [ 2 ] . split ( ' ' ) ;


  // Initialize the variable to store the maximum number of candies found.
  let answer = 0 ;

  // Iterate through each possible 'process_up' configuration.
  for ( let process_up = 0 ; process_up < process_sum ; process_up ++ ) {
    // Calculate the corresponding 'process_down' based on 'process_up'.
    let process_down = process_sum - process_up - 1 ;

    // Initialize candies for the current configuration.
    let candies = 0 ;

    // Sum candies from the 'up' array based on 'process_up'.
    for ( let i = 0 ; i <= process_up ; i ++ ) {
      candies += parseInt ( up [ i ] ) ; // Convert string to integer and add.
    }

    // Sum candies from the 'down' array based on 'process_down' and current 'process_up'.
    for ( let i = 0 ; i <= process_down ; i ++ ) {
      candies += parseInt ( down [ process_up + i ] ) ; // Convert string to integer and add.
    }

    // Update the overall maximum answer if the current 'candies' sum is greater.
    if ( answer < candies ) {
      answer = candies ;
    }
  }

  // Output the final maximum answer to the console.
  console . log ( answer ) ;
}

// Invoke the Main function with input read from standard input.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;