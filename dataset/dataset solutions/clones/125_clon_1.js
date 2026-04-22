/*
 *  File: Bitmask Processor
 *  Description: This JavaScript code reads numerical input,
 *               interprets each number as a bitmask, and then
 *               outputs the decimal values of the set bits.
 *  Author: Code Clone Generator
 *  Date: 2023-10-27 (Example Date)
 *
 *  This is a Type I clone, meaning it is functionally identical
 *  to the original code, with variations only in whitespace and comments.
 *  All identifiers, operators, and expressions remain semantically unchanged.
 */


// Begin main execution block.
// The entire logic is encapsulated within two nested 'for' loops.

for
(
    // Outer loop initialization: 'j' serves as an index for input tokens.
    j = 0
    ;

    /*
     * Outer loop condition and input acquisition:
     * This part is crucial. It first reads data from standard input,
     * splits it by whitespace, and then retrieves the token at index 'j'.
     * The value is assigned to 'i'.
     * The 'j++' post-increment ensures the next token is read in the subsequent iteration.
     * The loop continues as long as 'i' (the read token) is a truthy value.
     *
     * require ( "fs" )                            - Imports the Node.js File System module.
     * . readFileSync ( "/dev/stdin", "utf8" )     - Reads the entire content of standard input
     *                                               synchronously, decoding it as UTF-8.
     * . split ( /\s/ )                            - Splits the input string into an array of substrings
     *                                               using any whitespace character as a delimiter.
     * [ j++ ]                                     - Accesses the element at index 'j' from the
     *                                               split array, then increments 'j'.
     */
    i = require ( "fs" )
        . readFileSync ( "/dev/stdin" , "utf8" )
        . split ( /\s/ )
        [ j++ ]
    ;

    /*
     * Outer loop's final expression (often called 'increment' part):
     * This statement executes after each full iteration of the inner loop,
     * but before the next evaluation of the outer loop's condition.
     * It prints the accumulated string 'a' (which contains the set bits for the current 'i'),
     * after removing any leading or trailing whitespace.
     */
    console
        . log
            (
                a
                    . trim
                        (
                            /* No arguments for trim() method */
                        )
            )
)
{
    // The body of the outer loop is itself another 'for' loop.
    // This inner loop iterates through potential bit positions.
    for
    (
        /*
         * Inner loop initialization:
         * 'a' is reset to an empty string for accumulating results of the current number.
         * 'k' is initialized to 0, serving as the current bit position (0-indexed).
         */
        a = '' ,
        k = 0
        ;

        /*
         * Inner loop condition:
         * The loop continues as long as 'k' is less than 9.
         * This checks bits from position 0 up to 8 (inclusive).
         * (9 - k) evaluates to a truthy value as long as k < 9.
         */
        9 - k
        ;

        /*
         * Inner loop increment:
         * 'k' is incremented to move to the next bit position.
         */
        k++
    )
    {
        /*
         * Inner loop body: Bit checking and string accumulation.
         * This uses a ternary operator for concise conditional logic.
         *
         * ( n = 1 << k )           - Calculates 2 to the power of 'k'.
         *                            This creates a bitmask with only the k-th bit set.
         *                            The result is stored in 'n'.
         *
         * ( n & i )                - Performs a bitwise AND operation between 'n' and 'i'.
         *                            If the k-th bit is set in 'i', the result will be non-zero (truthy).
         *                            Otherwise, the result will be zero (falsy).
         *
         * ? a += n + ' '           - If the k-th bit is set, append the value of 'n'
         *                            (the decimal value of the set bit) followed by a space
         *                            to the string 'a'.
         *
         * : 0                      - If the k-th bit is not set, do nothing.
         *                            '0' here serves as a no-op in the ternary operator's
         *                            "else" branch, as 0 is a falsy value and doesn't affect 'a'.
         */
        ( n = 1 << k ) & i
            ? a += n + ' '
            : 0
        ; // Semicolon for the ternary statement, completing the inner loop's body.
    } // End of inner 'for' loop body.
} // End of outer 'for' loop body.

// End of script execution.