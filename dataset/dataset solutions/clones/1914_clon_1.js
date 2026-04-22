/* This is a Type I clone generated to demonstrate code transformation
 * while preserving logical and structural identity.
 * Only whitespace and comments are modified extensively. */

                                 // Defines the main function that processes the input.
function   main (   input   ) {

    // The input string is initially split by newline characters.
    input = input.split ( '\n' ) ;

    // Extracts the first number, K, from the processed input array.
    const K = Number ( input [ 0 ] ) ;

    // Extracts the range [A, B] from the second line of input.
    // It splits the string by space and converts parts to numbers.
    const   [   A   ,   B   ]   =   input   [   1   ]   .   split   (   ' '   )   .   map   (   Number   )   ;


    // Iterates through the numbers from A to B (inclusive).
    for   (   let   i   =   A   ;   i   <=   B   ;   i   ++   )   {

        // Checks if the current number 'i' is perfectly divisible by K.
        if   (   i   %   K   ===   0   )   {

            // If a multiple is found, print 'OK' to the console.
            console   .   log   (   'OK'   )   ;

            // Immediately exits the function as the condition is met.
            return   ;

        }   // End of if condition check.

    }   // End of for loop iteration.


    // If no multiple of K is found within the range [A, B],
    // print 'NG' to the console.
    console   .   log   (   'NG'   )   ;

}   // End of the main function definition.


// This section reads input from standard input,
// trims any leading/trailing whitespace, and then
// passes it to the main function for processing.
main   (   require   (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )   .   trim   (   )   )   ;