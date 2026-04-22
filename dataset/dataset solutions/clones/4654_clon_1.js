/*
 * This file contains a solution to an algorithmic problem,
 * typically found on platforms like AtCoder.
 * Original problem link: https://atcoder.jp/contests/agc012/tasks/agc012_a
 *
 * This is a Type I clone, meaning only whitespace and comments
 * have been altered for visual distinction, while maintaining
 * exact functional and structural identity.
 */

"use strict"
; // Enforces strict mode for cleaner code and fewer errors.


function Main ( input )
{
    // Process the raw input string:
    // 1. Remove leading/trailing whitespace.
    // 2. Split into an array of strings based on newline characters.
    const params = input . trim ( ) . split ( "\n" ) ;

    // Extract the value of N from the first line of parameters.
    // N represents the number of groups or iterations needed.
    const N = Number ( params [ 0 ] . trim ( ) ) ;

    /*
     * Parse the second line of input:
     * 1. Remove any leading/trailing whitespace.
     * 2. Split the string into an array of individual number strings using space as a delimiter.
     * 3. Convert each string element to a numeric type using the Number constructor.
     * 4. Sort the resulting array of numbers in descending order (largest to smallest).
     *    The comparison function (a, b) => b - a achieves this.
     */
    const sortedA = params [ 1 ]
                        . trim ( )
                        . split ( " " )
                        . map ( Number )
                        . sort ( ( a , b ) => b - a )
                        ;

    // Initialize a variable to accumulate the total sum.
    let total = 0
                ;

    // Loop N times to select elements according to the problem logic.
    // In this specific problem, we are summing elements at indices 1, 3, 5, ...
    // from the sorted array (0-indexed).
    for ( let i = 0 ; i < N ; i ++ )
    {
        // Add the element at the calculated index (i * 2 + 1) to the total.
        // This corresponds to picking the 2nd, 4th, 6th... largest elements
        // from the overall sorted list, which are effectively the middle
        // elements of each group of three after sorting.
        total += sortedA [ i * 2 + 1 ] ;
    }

    // Output the final calculated total to the console.
    console . log ( total ) ;
}


/*
 * The following line is boilerplate code for competitive programming platforms.
 * It reads all standard input, converts it to a UTF-8 string,
 * and passes it to the Main function.
 * Do not modify this part of the code.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;