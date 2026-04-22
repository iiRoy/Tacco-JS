/*
 * This file contains JavaScript code
 * designed to solve a specific problem:
 * counting combinations of four single digits (0-9)
 * that sum up to a given target number.
 *
 * This is a Type I clone, meaning only whitespace
 * and comments have been altered from the original.
 */


    var   MIN   =   0 , /* Minimum digit value */

        MAX   =   9 ; /* Maximum digit value allowed */


// --- Standard Input Configuration ---


process.stdin.resume ( ) ; // Ensures the input stream stays open.


    process . stdin . setEncoding ( 'utf8' ) ; // Sets the character encoding for incoming data.


/*
 * Event handler for 'data' events on the standard input stream.
 * This function will be executed whenever new data is available.
 */
process . stdin . on ( "data" , function ( chunk ) {


        // Process the incoming data chunk:
        // 1. Convert to string.
        // 2. Remove leading/trailing whitespace.
        // 3. Split into an array of strings by newline character.
        // 4. Map each string to its integer representation.
    var   n   =   String ( chunk ) . trim ( ) . split ( "\n" ) . map ( parseInt ) ,

        count   =   0 ; // Initialize a counter for valid combinations.


        // Iterate through each target number provided in the input array 'n'.
    for   (   var   m   =   0   ;   m   <   n . length   ;   m ++   )   {


        count   =   0 ; // Reset the combination counter for the current target number.


            // Begin nested loops to generate all possible four-digit combinations.
        for   (   var   i   =   MIN   ;   i   <=   MAX   ;   i ++   )   {


            for   (   var   j   =   MIN   ;   j   <=   MAX   ;   j ++   )   {


                for   (   var   k   =   MIN   ;   k   <=   MAX   ;   k ++   )   {


                    for   (   var   l   =   MIN   ;   l   <=   MAX   ;   l ++   )   {


                        // Check if the sum of the four current digits equals the target number.
                        if   (   i   +   j   +   k   +   l   ==   n [ m ]   )   {


                            count ++ ; // If it matches, increment the counter.

                        } // End of 'if' condition


                    } // End of 'l' loop


                } // End of 'k' loop


            } // End of 'j' loop


        } // End of 'i' loop


            // After checking all combinations for the current target number, print the total count.
        console . log ( count ) ;


    } // End of 'm' loop (iterating through input numbers)


} ) ; // End of 'data' event listener function.