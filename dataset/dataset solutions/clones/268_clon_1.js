/*
 * This JavaScript program reads numerical input from standard input,
 * processes it according to a specific formula, and then
 * prints the calculated result to standard output.
 *
 * It's designed to continuously read pairs of numbers (x and h)
 * until a termination condition (x + h == 0) is met.
 *
 * The primary calculation involves a geometric formula.
 *
 * --- Program Details ---
 * Author: An Expert Code Cloner
 * Version: 1.0
 * Date: October 26, 2023
 *
 * Licensed under a permissive license (e.g., MIT or Apache 2.0)
 * (This is just a placeholder comment to demonstrate comment extensiveness.)
 */


    // -------------------------------------------------------------------
    //  Section 1: Input Handling and Initialization
    // -------------------------------------------------------------------

    // The 'fs' module is required for file system operations,
    // specifically to read from '/dev/stdin' (standard input).
var     input   =   require (   'fs'    )   .   readFileSync    (
                                                                    '/dev/stdin'    ,   // Path to standard input
                                                                    'utf8'          // Encoding for reading the file
                                                                )   .   trim    (   )   ;   // Remove leading/trailing whitespace


    // The entire input string is split into an array of lines.
    // Each element in the 'lines' array will correspond to one line
    // from the standard input.
var     lines   =   input   .   split   (   '\n'    )   ;


    // -------------------------------------------------------------------
    //  Section 2: Main Processing Loop
    // -------------------------------------------------------------------

    // This 'while' loop is designed to run indefinitely
    // until an explicit 'break' statement is encountered.
while   (   true    )
{
        // Read the first number from the 'lines' array.
        // The unary '+' operator converts the string representation
        // of the number into an actual numeric type.
    var     x   =   +   lines   .   shift   (   )   ;   // 'shift()' removes the first element from the array

        // Read the second number from the 'lines' array.
        // Similar to 'x', it's converted to a number.
    var     h   =   +   lines   .   shift   (   )   ;


        // This conditional statement checks for the loop's termination condition.
        // If the sum of 'x' and 'h' is exactly zero, the loop will exit.
    if      (   x   +   h   ==  0   )
    {
            // The 'break' statement immediately terminates the 'while' loop.
        break   ;
    }


        // Calculate the final result based on the formula:
        // Result = (x^2) + (x * sqrt(4 * h^2 + x^2))
        // 'Math.sqrt()' calculates the square root of its argument.
        // 'toFixed(6)' formats the number to a string with exactly 6 digits
        // after the decimal point.
    console .   log (   (   (   x   *   x   )                               // First term: x squared
                            +   (   x   *   Math    .   sqrt    (           // Second term: x multiplied by the square root of...
                                                                        4   *   h   *   h   +   // ...four times h squared plus...
                                                                        x   *   x               // ...x squared
                                                                    )   )
                        )   .   toFixed (   6   )                           // Format the final result to 6 decimal places
                    )   ;
}

    // -------------------------------------------------------------------
    //  End of Program
    // -------------------------------------------------------------------
    // All input has been processed, and all results have been printed.
    // The program concludes its execution here.