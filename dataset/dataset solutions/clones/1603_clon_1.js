/*
 * This file contains a Type I clone of the original JavaScript code.
 *
 * According to the definition of a Type I clone:
 * - All identifiers (variable names, function names), operators, and expressions
 *   are preserved exactly as they were in the source code.
 * - The only alterations made are to whitespace (such as indentation,
 *   spacing around operators, and blank lines) and comments (new comments
 *   have been added, and existing ones potentially modified or removed,
 *   though in this case, the original comment was retained).
 *
 * The primary goal is to make the code *visually distinct* from the original
 * while maintaining *absolute functional equivalence*.
 */

function   Main   (   input   )
{
    // The input parameter, which is a string, is split by spaces.
    // This converts the single string into an array of strings.
    input  =  input .  split  (  " "  )  ;

    // An empty array named 'result' is initialized.
    // In the original provided logic, this variable appears to be unused.
    result   =   [ ]   ;


    // A loop iterates over the indices of the 'input' array.
    // Each string element in the array is converted into a number.
    for   (   i   in   input   )
    {
        // Convert the string at the current index 'i' to a Number type.
        input  [  i  ]   =   Number   (   input  [  i  ]   )   ;
    }


    // --- Start of the main conditional logic block ---

    // The first condition checks if the initial number (input[0])
    // is strictly greater than the product of the second and third numbers (input[1] * input[2]).
    if   (   input  [  0  ]   >   input  [  1  ]   *   input  [  2  ]   )
    {
        // If the condition is true, the difference between input[0] and the product is logged.
        console .  log   (   input  [  0  ]   -   input  [  1  ]   *   input  [  2  ]   )   ;
    }
    else
    {
        // If the first condition is false, execution proceeds to this 'else' block.
        // A nested conditional check is performed here.

        // This condition evaluates if the parity of a rounded ratio (input[0] / input[2])
        // matches the parity of the second number (input[1]).
        if   (
            Math .  round   (   input  [  0  ]   /   input  [  2  ]   )   %   2
            ==
            input  [  1  ]   %   2
        )
        {
            // If the parities match, the absolute difference between input[0]
            // and (input[1] multiplied by the rounded ratio) is logged.
            console .  log   (
                Math .  abs   (
                    input  [  0  ]
                    -
                    input  [  1  ]   *   Math .  round   (   input  [  0  ]   /   input  [  2  ]   )
                )
            )   ;
        }
        else
        {
            // If the parities do not match, another nested 'else' block is entered.
            // This contains a further conditional check.

            // This condition checks if a specific calculated value (input[0] - input[1] * Math.round(input[0] / input[2]))
            // is less than zero.
            if   (
                input  [  0  ]   -   input  [  1  ]   *   Math .  round   (   input  [  0  ]   /   input  [  2  ]   )
                <
                0
            )
            {
                // If the value is negative, a different absolute difference is calculated and logged.
                // This involves input[2] multiplied by (the rounded ratio plus one).
                console .  log   (
                    Math .  abs   (
                        input  [  0  ]
                        -
                        input  [  2  ]   *   (   Math .  round   (   input  [  0  ]   /   input  [  2  ]   )   +   1   )
                    )
                )   ;
            }
            else
            {
                // If the value is not negative (i.e., it's zero or positive),
                // yet another absolute difference is calculated and logged.
                // This involves input[2] multiplied by (the rounded ratio minus one).
                console .  log   (
                    Math .  abs   (
                        input  [  0  ]
                        -
                        input  [  2  ]   *   (   Math .  round   (   input  [  0  ]   /   input  [  2  ]   )   -   1   )
                    )
                )   ;
            }   // End of the innermost 'if-else' block
        }   // End of the middle 'if-else' block
    }   // End of the outermost 'if-else' block
}   // End of the Main function definition


// Call the 'Main' function with a predefined string as input.
Main   (   `10 4 3`   )   ;

// The following line is commented out in the original source.
// It typically provides a way to read input from standard input in certain environments.
// Main(require("fs").readFileSync("/dev/stdin", "utf8"));