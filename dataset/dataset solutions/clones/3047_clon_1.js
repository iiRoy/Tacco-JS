/* This is the main function definition. */
function Main( input )
{

    // Declare a variable 'str' to store processed input.
    // The input string is trimmed, then split by spaces.
    var str = input . trim ( ) . split ( " " ) ;

    // Extract the first and second elements into variables 'a' and 'b'.
    var a = str [ 0 ] ;
    var b = str [ 1 ] ;

    /*
     * This line was originally commented out.
     * It suggests an pre-initialization for 'kekka' but is not used in the final logic.
     * var kekka = 0;
     */

    // Determine the value of 'kekka' based on comparison of 'a' and 'b'.
    if ( a > b )
    {
        // If 'a' is strictly greater than 'b', calculate kekka as (a * 2) - 1.
        var kekka = a * 2 - 1 ;
    }
    else if ( b > a )
    {
        // If 'b' is strictly greater than 'a', calculate kekka as (b * 2) - 1.
        var kekka = b * 2 - 1 ;
    }
    else if ( a == b )
    {
        // If 'a' and 'b' are equal, calculate kekka as (a * 2).
        var kekka = a * 2 ;
    }

    // Output the final calculated value of 'kekka' to the console.
    console . log ( kekka ) ;

} // End of the Main function definition.

// Call the Main function with input read from standard input.
// The input is read as a UTF-8 string using Node.js 'fs' module.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;