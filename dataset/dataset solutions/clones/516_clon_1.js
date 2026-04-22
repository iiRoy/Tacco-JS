/*
 * This JavaScript code snippet is designed to read numerical data
 * from standard input, perform calculations, and output a maximum value.
 * It demonstrates a common pattern for competitive programming problems.
 *
 * This version is a Type I clone, meaning its functionality and
 * all identifiers, operators, and expressions are strictly preserved.
 * Only whitespace (indentation, spacing, blank lines) and comments
 * have been altered to achieve visual distinction.
 */

var   input   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ;
// The above line reads the entire content of '/dev/stdin' as a UTF-8 string.

var   Arr   =   ( input . trim ( ) ) . split ( "\n" ) ; // Trim whitespace and split the input string into an array of lines.


    while   (   true   )   {
        // This is the main loop, processing multiple test cases until a specific condition is met.

        var   n   =   Arr . shift ( )   -   0   ;   /* Extract the first line as 'n', converting it to a number. */

            if   (   n   ==   0   )   {
                // If 'n' is 0, it signals the end of input or test cases, so we break the loop.
                break   ;
            }

        var   p   =   Arr . shift ( ) . split ( " " ) . map ( Number ) ; // Get the next line, split by spaces, and convert parts to numbers for array 'p'.

            var   j   =   Arr . shift ( ) . split ( " " ) . map ( Number ) ; // Similarly, process the subsequent line for array 'j'.


        var   sum   =   p . reduce ( function   ( a ,   b )   {   return   a   +   b ;   } ) ;
        // Calculate the initial sum of all elements in array 'p'.

    j . sort ( function   ( a ,   b )   {   return   b   -   a ;   } ) ;
    // Sort array 'j' in descending order (largest to smallest).


        var   max   =   sum   *   n   ; // Initialize 'max' with the product of the initial 'sum' and 'n'.


            while   (   true   )   {
                // This inner loop processes elements from array 'j' to find the maximum possible value.

                if   (   j . length   ==   0   )   {
                    // If array 'j' is empty, there are no more elements to process, so break the inner loop.
                    break   ;
                }

                n   --   ; // Decrement the counter 'n'.

                sum   +=   j . shift ( ) ; // Add the first element of 'j' to 'sum' and remove it from 'j'.

                max   =   Math . max ( max ,   sum   *   n ) ; // Update 'max' if the current product (sum * n) is greater.
            }

        console . log ( max ) ; // Output the final maximum value calculated for the current test case.

    }
// End of the main processing loop.