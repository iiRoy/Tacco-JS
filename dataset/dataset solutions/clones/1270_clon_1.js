/* This is a Type I clone example.
 * The original logic is preserved exactly.
 * Only whitespace and comments have been altered.
 * This script processes a single line of input.
 */

var  reader   =   require (  'readline'  )
  .  createInterface   (
    {
      // Configuration for the readline interface
      input   :   process . stdin,  // Standard input stream
      output  :   process . stdout  // Standard output stream
    }
  )   ;

// Event listener for each line read from standard input
reader . on (  'line'  ,   function   (  line  )
  {
    /* Initialize variables:
     * i: loop counter for the main iteration.
     * x: temporary number used for digit-by-digit checking.
     * result: string accumulator for the final output.
     */
    var   i  ,  x  ,  result   =   ""   ;


    // Split the input line string by a single space character
    // into an array of strings.
    var   a   =   line . split (  ' '  )   ;


    // Parse the first element of the array 'a' into an integer.
    // The radix (base) is specified as 10 to ensure decimal parsing.
    var   b   =   parseInt (  a [ 0 ]  ,  10  )   ;


    // Main loop: iterates from 3 up to and including the value of 'b'.
    for   (  i   =   3   ;   i   <=   b   ;   i++  )
      {
        x   =   i   ;  // Assign current loop value to 'x' for manipulation.

        // Conditional check: Is 'x' perfectly divisible by 3?
        if   (  x   %   3   ==   0  )
          {
            result   +=   " "   ;  // Append a space as a separator.
            result   +=   x   ;       // Append the number 'x' to the result string.
          }
        else
          {
            // If 'x' is not divisible by 3, proceed to check its digits.
            // This inner loop continues indefinitely until a 'break' condition is met.
            for   (  ;   ;   x   /=   10  )
              {
                // If 'x' becomes less than 1, it means all digits have been checked.
                if   (  x   <   1  )
                  {
                    break   ;  // Exit the inner loop.
                  }

                // Check if the last digit of 'x' is 3.
                // The modulo operator (%) gives the remainder when divided by 10.
                if   (  x   %   10   ==   3  )
                  {
                    result   +=   " "   ;  // Append a space as a separator.
                    result   +=   x   ;       // Append the number 'x' to the result string.
                    break   ;  // Exit the inner loop as a '3' was found.
                  }
              }
          }
      }

    // Output the final accumulated result string to the console.
    console . log (  result  )   ;

    // Terminate the Node.js process immediately.
    process . exit ( )   ;
  }
)   ;


/*
 * This event handler for the 'end' event on process.stdin is included
 * for completeness. However, due to the process.exit() call above,
 * this specific handler might not always be reached or executed
 * in the typical flow of this script.
 */
process . stdin . on (  'end'  ,   function   (  )
  {
    // No specific operation is defined to be performed
    // when the standard input stream signals its end.
  }
)   ;