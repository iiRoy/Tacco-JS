/*
 * This JavaScript program calculates one of two possible values (x or y)
 * based on input parameters and then prints the smaller of the two.
 *
 * The program assumes numerical input separated by spaces.
 *
 * Author: Code Clone Generator (Type I)
 * Version: 1.0
 * Date: 2023-10-27
 */


// Main function definition.
// It takes a single string 'input' as its argument.
function   main (   input   )
{

    // Split the input string by spaces into an array of strings.
    // This array 'arr' will hold all the numerical components.
    const   arr   =   input .   split (   " "   ) ;

    // Calculate the first value, 'x'.
    // This involves division, ceiling operation, and multiplication.
    // arr[0] / arr[1] is divided, then Math.ceil is applied, then multiplied by arr[2].
    const   x   =   Math .   ceil (   arr [ 0 ]   /   arr [ 1 ]   )   *   arr [ 2 ] ;

    // Calculate the second value, 'y'.
    // Similar to 'x', but uses different indices from the 'arr' array.
    // arr[0] / arr[3] is divided, then Math.ceil is applied, then multiplied by arr[4].
    const   y   =   Math .   ceil (   arr [ 0 ]   /   arr [ 3 ]   )   *   arr [ 4 ] ;


    // Compare 'x' and 'y' and print the smaller one to the console.
    // Uses a ternary operator for conditional output.
    // If x is greater than y, print y; otherwise, print x.
    x   >   y   ?   console .   log (   y   )   :   console .   log (   x   ) ;

} // End of the main function definition.


// Program entry point.
// Reads input from standard input (typically /dev/stdin in Unix-like systems)
// using Node.js 'fs' module and passes it to the main function.
main (   require ( 'fs' ) .   readFileSync ( '/dev/stdin' ,   'utf8' )   ) ; // Execute the main logic.