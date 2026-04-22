/*
 * This is a Type I clone of the original JavaScript code.
 * It strictly adheres to the definition: "Code fragments are exactly equal,
 * except for possible variations in whitespace and comments."
 *
 * All identifiers, variable names, function names, operators, and expressions
 * remain completely unchanged.
 *
 * Only whitespace (indentation, spacing, blank lines) and comments
 * (add, remove, or modify them) have been altered extensively
 * to create a visually different, yet logically and structurally identical,
 * version of the original code.
 */

'use strict' /* Enforce strict mode for cleaner code and fewer errors. */ ;


/**
 * The main function processes input string 's' to calculate a result.
 * @param {string} s - The input string, typically from standard input.
 */
function main  ( s )
{

  // Process the input string:
  // 1. Split by newline to get the first line.
  // 2. Split that line by space to get individual number strings.
  // 3. Map each string to a Number.
  s = s . split ( '\n' ) [ 0 ] . split ( ' ' ) . map ( n => Number ( n ) ) ;


  const N = s [ 0 ] ; /* First number from the input array. */

  const M = s [ 1 ] ; /* Second number from the input array. */


  // Calculate the initial answer: |N - 2| * |M - 2|.
  // This uses Math.abs to ensure positive values for the difference.
  let ans = Math . abs ( N - 2 ) * Math . abs ( M - 2 ) ;


  // Check if the calculated answer exceeds JavaScript's maximum safe integer.
  // If it does, a custom multiplication function for large numbers is used.
  if ( ans > Number . MAX_SAFE_INTEGER )
  {
    /*
     * If the product exceeds Number.MAX_SAFE_INTEGER,
     * we need to perform multiplication using a custom big integer approach,
     * typically by treating numbers as arrays of digits for "long multiplication".
     */
    const multi_biggerInt = ( a , b ) =>
    {
      // Convert numbers to arrays of digits, reversing them for easier long multiplication.
      const num1 = String ( a ) . split ( '' ) . map ( n => Number ( n ) ) . reverse ( ) ;
      const num2 = String ( b ) . split ( '' ) . map ( n => Number ( n ) ) . reverse ( ) ;


      // Initialize an array to store the result digits.
      // Its maximum length is the sum of the lengths of the two numbers.
      let ans = [ ... Array ( num1 . length + num2 . length ) ] . fill ( 0 ) ;


      /*
       * Helper function to handle carries in the result array.
       * It iterates through the digits and adjusts values if any digit is 10 or greater.
       */
      const checkCarry = ( ) =>
      {
        for ( let i = 0 ; i < ans . length ; i ++ )
        {
          // If a digit is 10 or more, carry over to the next (higher) digit.
          if ( ans [ i ] >= 10 )
          {
            // Extract the upper part (carry) and lower part (current digit).
            const upper = Number ( String ( ans [ i ] ) . split ( '' ) [ 0 ] ) ;
            const lower = Number ( String ( ans [ i ] ) . split ( '' ) [ 1 ] ) ;

            // Add the carry to the next digit (at i-1 because array is reversed logic).
            ans [ i - 1 ] += upper ;
            // Set the current digit to its lower part.
            ans [ i ] = lower ;
          }
        }
      }


      /*
       * Perform the long multiplication (筆算 - hissann).
       * Each digit of num1 is multiplied by each digit of num2.
       */
      for ( let i = 0 ; i < num1 . length ; i ++ )
      {
        for ( let j = 0 ; j < num2 . length ; j ++ )
        {
          const pro = num1 [ i ] * num2 [ j ] ; // Product of individual digits.
          // Determine the correct position for this product in the result array.
          // ans array is conceptually reversed, so (i+j) corresponds to the digit place.
          const digit = ans . length - ( i + j ) - 1 ;

          ans [ digit ] += pro ; // Add the product to the corresponding digit position.
          checkCarry ( ) ; // After each addition, check for and handle carries.
        }
      }

      /*
       * Remove leading zeros from the result array to get the significant digits.
       * This finds the first non-zero digit and slices the array from there.
       */
      for ( let i = 0 ; i < ans . length ; i ++ )
      {
        if ( ans [ i ] !== 0 )
        {
          ans = ans . slice ( i ) ; // Slice the array to remove leading zeros.
          break ; // Exit loop once first significant digit is found.
        }
      }

      // Convert the array of digits back into a single string representation of the number.
      return ans . join ( '' ) ;
    }

    // Re-calculate 'ans' using the big integer multiplication function.
    ans = multi_biggerInt ( Math . abs ( N - 2 ) , Math . abs ( M - 2 ) ) ;
  }

  // Output the final calculated answer to the console.
  console . log ( ans ) ;
}


// Read input from /dev/stdin (standard input), decode it as UTF-8, and pass it to the main function.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;