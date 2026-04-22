/*
 * This JavaScript module defines a 'Main' function
 * which processes input to compute a specific BigInt value.
 * The computed value is then printed to the console as a string.
 */

function   Main   (   input   )
{
    // Declare and initialize two BigInt variables, 'a' and 'b',
    // using array destructuring assignment.
    // The input string is first split by a space character,
    // and then each resulting substring is converted to a BigInt.
    var   [   a   ,   b   ]   =
        input   .   split   (   " "   )   // Splits the input string into an array of strings.
        .   map   (   BigInt   )   ;    // Converts each string in the array to a BigInt.

    // The core logic calculates a BigInt result and converts it to a string for output.
    // It involves a series of nested conditional (ternary) operators
    // and arithmetic operations on BigInts.
    console   .   log   (
        (
            // Primary conditional check: Is either 'a' or 'b' equal to 1n (BigInt one)?
            (   a   ==   1n   ||   b   ==   1n   )

            ?   // If the primary condition is true (at least one of them is 1n):
                (
                    // Secondary conditional check: Are 'a' and 'b' strictly equal?
                    (   a   ==   b   )
                    ?   // If 'a' and 'b' are equal (implies both are 1n, as per outer condition)
                        0n   // The result is BigInt zero.
                    :   // If 'a' and 'b' are not equal:
                        (
                            // Tertiary conditional check: Is 'a' equal to 1n?
                            (   a   ==   1n   )
                            ?   // If 'a' is 1n, the result is 'b' minus 2n.
                                b   -   2n
                            :   // If 'b' is 1n (since 'a' is not 1n and one of them is 1n)
                                a   -   2n   // The result is 'a' minus 2n.
                        )
                )

            :   // If the primary condition is false (neither 'a' nor 'b' is 1n, meaning both are >= 2n):
                (
                    // Calculate a more complex expression for this case:
                    // (a * b) - ((a - 2n) * 2n + (b - 2n) * 2n) - 4n
                    a   *   b
                    -   // Subtract the sum of two terms:
                    (
                        // First term of the sum: (a - 2n) multiplied by 2n.
                        (   a   -   2n   )   *   2n
                        +   // Add the second term to the first:
                        // Second term of the sum: (b - 2n) multiplied by 2n.
                        (   b   -   2n   )   *   2n
                    )
                    -   // Finally, subtract 4n from the entire expression.
                    4n
                )
        )
        .   toString   (   )   // Convert the final BigInt result to its string representation.
    )   ; // End of the console.log statement.
}


/*
 * This section handles the initial execution of the program.
 * It reads input from the standard input stream, processes it,
 * and then invokes the 'Main' function with the prepared input.
 */
Main
(
    require   (   "fs"   )   // Load the Node.js 'fs' (file system) module for file operations.
        .   readFileSync   (   // Use the readFileSync method to synchronously read content from a file.
            "/dev/stdin"   ,   // Specify the file path as standard input (typically for competitive programming).
            "utf8"             // Specify UTF-8 as the character encoding for the input.
        )
        .   trim   (   )       // Remove any leading or trailing whitespace from the input string read.
)   ; // End of the Main function invocation, completing program execution.