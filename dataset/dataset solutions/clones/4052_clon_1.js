/* This is an extensively modified Type I clone of the original JavaScript code.
 * It adheres strictly to the Type I definition by preserving all identifiers,
 * variable names, function names, operators, and expressions exactly as they were.
 * Only whitespace (indentation, spacing, blank lines) and comments have been altered
 * or added to create a visually distinct, yet logically identical, representation.
 */

"use strict"     ; //  Enforce strict mode to catch common coding errors and improve performance.


/*
 *  The primary function responsible for processing input and computing the result.
 *  This function simulates finding combinations of coins that sum up to a target value.
 *
 *  @param {string} input - The raw string data received from standard input.
 */
function         Main (   input   )
{

    //  Split the incoming string data into an array of lines,
    //  after trimming any leading/trailing whitespace from the whole input.
    const args = input . trim ( ) . split ( '\n' ) ;


    //  Parse the first four lines of input into numerical constants.
    //  These represent the maximum counts of each coin type (500, 100, 50 yen)
    //  and the target total amount (X).
    const A = Number ( args [ 0 ] ) ; // Maximum number of 500-yen coins available.

    const B = Number ( args [ 1 ] ) ; // Maximum number of 100-yen coins available.

    const C = Number ( args [ 2 ] ) ; // Maximum number of 50-yen coins available.

    const X = Number ( args [ 3 ] ) ; // The target total amount (in yen) to achieve.


    let ret = 0 ; // Initialize a counter to store the number of valid combinations.


    //  Begin a series of nested loops to iterate through all possible combinations
    //  of the available coins (a for 500-yen, b for 100-yen, c for 50-yen).
    //  The loops run from 0 up to the maximum available count for each coin type.
    for ( let a = 0 ; a <= A ; ++a ) { // Loop for the number of 500-yen coins.

        for ( let b = 0 ; b <= B ; ++b ) { // Nested loop for the number of 100-yen coins.

            for ( let c = 0 ; c <= C ; ++c ) { // Innermost loop for the number of 50-yen coins.

                //  Calculate the current total value for the combination (a, b, c).
                let cnt = 500 * a + 100 * b + 50 * c ;

                //  Check if the calculated total value matches the target amount X.
                if ( X == cnt ) {
                    // If it matches, increment the counter for valid combinations.
                    ++ret ;
                }
            } // End of inner loop (50-yen coins).
        } // End of middle loop (100-yen coins).
    } // End of outer loop (500-yen coins).


    //  Finally, print the total number of combinations found to the standard output.
    console . log ( ret ) ;
}


//  --- Program Execution Entry Point ---
//  This line reads the entire content of the standard input ("/dev/stdin")
//  as a UTF-8 encoded string and then passes it to the `Main` function for processing.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;