/*
 * This is the main function that processes the input data.
 * The 'input' parameter is expected to contain all raw data.
 */
function   Main(   input   )
{
    // The input string is split by newline characters.
    // Each line then becomes an element in the 'input' array.
    input  =  input.split( "\n" )  ;

    /*
     * Declare variables 'a', 'b', 'p', and 'N'.
     * 'a' will store the first line of input.
     * 'b' will store the second line of input, parsed as an integer.
     */
    var   a   =   input[0]   ;
    var   b   =   parseInt(   input[1]   ,   10   )   ;

    var   p   =   0   ;   // Initialize accumulator 'p' to zero.

    // N is a large constant used in the power calculation.
    var   N   =   5   *   Math.pow(   10   ,   15   )   ;


    // Loop through each character of string 'a'.
    for   (   var   i   =   0   ;   i   <   a.length   ;   i++   )
    {
        // Calculate a power and add to 'p'.
        p   +=   Math.pow(   a[i]   ,   N   )   ;

        // Check if 'b' is less than or equal to 'p'.
        if   (   b   <=   p   )
        {
            // If the condition is met, print the current character from 'a'.
            console.log(   '%d'   ,   a[i]   )   ;

            // Exit the loop early.
            break   ;
        }
    }
    // No explicit output statement here, as it's handled within the loop.

}   // End of Main function.

// This line is crucial for execution in the specific environment.
// It reads from standard input and passes it to the Main function.
Main(   require(   "fs"   )   .   readFileSync(   "/dev/stdin"   ,   "utf8"   )   )   ;