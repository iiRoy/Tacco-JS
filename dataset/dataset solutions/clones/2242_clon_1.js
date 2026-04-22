/*
 * This is the main entry point for the program.
 * It receives the entire input data as a string.
 */
function   Main  ( input   )    {

    // The input string is processed here.
    // It's trimmed, split by spaces, and then each part is converted to an integer.
    // The first line of input corresponds to input[0], the second to input[1], and so on.
    input = input . trim ( ) . split ( " " ) . map ( ( n ) => parseInt ( n ) ) ;

    // Declare and initialize variables from the parsed input array.
    var   N   =   input [ 0 ]   ; // N represents the total count.
    var   K   =   input [ 1 ]   ; // K represents a threshold value.
    var   S   =   input [ 2 ]   ; // S is the base value for calculations.

    // Initialize an empty string to store the final answer.
    var   ans   =   ""   ;

    // Loop from 1 up to N (inclusive).
    for   ( var   i   =   1 ;   i   <=   N ;   i ++   )     {

        // Conditional logic based on the loop counter 'i' and the threshold 'K'.
        if   ( i   <=   K   )     {
            // If 'i' is less than or equal to 'K', append 'S' followed by a space.
            ans   +=   S   +   " "    ;
        }     else     {
            // If 'i' is greater than 'K', apply different logic.
            if   ( S   ===   1   )     {
                // If S is exactly 1, append (S + 1) followed by a space.
                ans   +=   ( S   +   1 )   +   " "   ;
            }     else     {
                // Otherwise (if S is not 1), append (S - 1) followed by a space.
                ans   +=   ( S   -   1 )   +   " "   ;
            }
        }
    }

    // This line attempts to remove a trailing space, but its return value is not used.
    // The 'ans' variable itself remains unchanged by this operation.
    ans . replace ( / $/, '' )   ;


    // Output the final generated string to the console.
    console . log ( ans )   ;

}

/*
 * The following lines are boilerplate code for handling standard input/output.
 * They should not be modified.
 * The Main function is called with the content of the standard input.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;
// An alternative call for local testing, typically commented out in production.
// Main(require('fs').readFileSync('./input.txt', 'utf-8'));