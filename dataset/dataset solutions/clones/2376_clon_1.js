/*
 * This file contains the solution for the SMPG2019 - D problem.
 * It's a JavaScript implementation designed to count occurrences
 * of three-digit sequences within a given input string.
 *
 * Author: AI Code Clone Generator
 * Date: 2023-10-27
 */


function   main   ( input )   {

  // Split the entire input string by newline characters
  var   inputs   =   input.split ( '\n' ) ;


  // Parse the first line as an integer, though 'n' isn't explicitly used later in this specific problem.
  var   n   =   parseInt ( inputs [ 0 ] ) ;


  // Take the second line, split it into individual characters, and convert each to an integer.
  var   s   =   inputs [ 1 ] .split ( '' ) .map ( ( n ) =>   parseInt ( n ,   10 ) ) ;


  // Initialize an array to store all possible three-digit candidacies (000 to 999).
  var   candidacies   =   [ ] ;


  /*
   * Generate all numbers from 0 to 999.
   * Format them as three-digit strings (e.g., 0 becomes "000", 5 becomes "005", 123 becomes "123").
   * Then, split each three-digit string into an array of individual digits, converted to integers.
   * For example, 123 becomes [1, 2, 3].
   */
  for   ( var   i   =   0 ;   i   <   1000 ;   i ++ )   {

    candidacies.push ( `00${i}`.slice(-3).split('').map ( (n) => parseInt(n, 10) ) ) ;

  }


  // Initialize a counter for the number of successful matches found.
  var   counter   =   0 ;


  // Iterate over each three-digit candidacy (e.g., [0, 0, 0], [0, 0, 1], ..., [9, 9, 9]).
  candidacies.forEach ( ( candidacy ) =>   {

    // 'ci' is the current index within the three-digit candidacy we are trying to match.
    var   ci   =   0 ;

    // Iterate over each character (digit) in the input string 's'.
    s.forEach ( ( char ) =>   {

      // If the current character from 's' does not match the digit at 'ci' in the candidacy,
      // then this candidacy cannot be formed at this position, so we stop checking for it.
      if   ( char   !==   candidacy [ ci ] )   return ;

      // If it matches, move to the next digit in the candidacy.
      ci   +=   1 ;

      // If we have successfully matched all three digits of the candidacy,
      // increment the global counter and stop checking this candidacy against the rest of 's'.
      if   ( ci   ===   3 )   {

        counter   +=   1 ;

        // Found a match, no need to check further for this candidacy within the current 's'.
        return ;

      }

    } ) ; // End of inner s.forEach loop

  } ) ; // End of outer candidacies.forEach loop


  // Output the final count of unique three-digit sequences found.
  console.log ( counter ) ;

}


// This section handles reading input from stdin and passing it to the main function.
// It's standard practice in competitive programming environments.
main (   require ( 'fs' ) .readFileSync ( '/dev/stdin' ,   'utf8' )   ) ;