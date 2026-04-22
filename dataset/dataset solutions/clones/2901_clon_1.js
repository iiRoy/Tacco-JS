/*
 * This function processes the input data.
 * The 'input' parameter initially contains all the raw input as a single string.
 */
function Main ( input )
{

    // Split the input string by spaces to get individual values.
    var input = input . split ( " " ) ;

    // Parse the first value as an integer for variable A.
    var A = parseInt ( input [ 0 ] , 10 ) ;

    // Parse the second value as an integer for variable P.
    var P = parseInt ( input [ 1 ] , 10 ) ;

    var a = 0 ; // This variable 'a' will be re-assigned shortly.

    // Calculate 'a' as P divided by 2, floored.
    var a = Math . floor ( P / 2 ) ;

    // Calculate 'b' as the remainder of P divided by 2.
    var b = P % 2 ;

    // Calculate 'c' based on A, b, and then divided by 2, floored.
    var c = Math . floor ( ( A * 3 + b ) / 2 ) ;

    // Calculate 'd' as the remainder of (A * 3 + b) divided by 2.
    var d = ( A * 3 + b ) % 2 ;

    /*
     * The following line was commented out in the original code.
     * It was likely used for debugging purposes to inspect intermediate values.
     * console.log(a, b, c, d);
     */

    // Output the sum of 'a' and 'c' to the console.
    console . log ( a + c ) ;


}


/*
 * Do not modify the code below this line.
 * It handles reading input from standard I/O and calling the Main function.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;