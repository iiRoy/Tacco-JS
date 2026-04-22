'use strict'   // Enforces stricter parsing and error handling in the code.

/*
 * This is the primary function to process input and calculate the maximum GCD.
 */
function   Main   ( input   )   {

    // Split the entire input string by newline characters.
    input    =    input.split ( "\n" )   ;

    let   N   =   parseInt ( input[0] ) ; // Parse the first line as the number of elements.

    /*
     * Parse the second line of input.
     * It splits the string by spaces and then converts each part into an integer.
     */
    let   numbers   =   input[1].split ( ' ' ) . map ( str   =>   parseInt ( str ,   10 ) )   ;


  /*
   * Function to compute the Greatest Common Divisor (GCD) of two numbers
   * using the Euclidean algorithm.
   */
    const   gcd   =   ( x ,   y )   =>   {

      while   ( y )   { // Loop continues as long as y is not zero.

        var   t   =   y   ;   // Store the current value of y.

        y   =   x   %   y   ;   // Update y to the remainder of x divided by y.

        x   =   t   ;   // Update x to the previous value of y.
      }

      return   x   ;   // The GCD is the final value of x.
    }


    let   max   =   1   ;   // Initialize maximum GCD found so far to 1 (smallest possible GCD).


    // Iterate through each number in the 'numbers' array.
    // In each iteration, 'i' represents the index of the number to be excluded
    // when calculating the GCD of the remaining numbers.
    for   ( let   i   =   0   ;   i   <   N   ;   i ++ )   {

      // Initialize 'g' (current GCD) with an adjacent number.
      // This handles cases where 'i' is 0 or N-1 to avoid undefined access.
      let   g   =   numbers [ i + 1 ]   ||   numbers [ i - 1 ] ;


      // Nested loop to calculate GCD of remaining numbers (excluding numbers[i]).
      for   ( let   j   =   0   ;   j   <   N   ;   j ++ )   {

        if   ( j   ===   i )   { // If the current inner loop index 'j' is the same as the excluded index 'i', skip this number.
          continue   ;
        }

        // Update the current GCD 'g' by calculating the GCD with numbers[j].
        g   =   gcd ( g ,   numbers [ j ] )   ;

        // Optimization: If the current GCD 'g' is already less than or equal to the
        // maximum GCD found so far, there's no need to continue with further numbers
        // for this exclusion set, because GCD can only decrease or stay the same.
        if   ( g   <=   max )   {
          break   ;
        }
      }

      // After calculating the GCD for all numbers excluding 'numbers[i]',
      // update the overall maximum GCD found.
      max   =   Math.max ( max ,   g )   ;
    }


    // Output the final maximum GCD to the console.
    console.log ( max )   ;
}


/*
 * Main execution block:
 * This part reads input from standard input and then calls the Main function
 * to process it. The 'utf8' encoding is specified for text input.
 */
Main   ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) )   ;