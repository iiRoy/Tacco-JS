/*
 * This script processes numerical input from standard input.
 * It reads values, performs a specific series of calculations
 * on each value, and then prints the formatted result.
 */
for  (
    // Initialize the outer loop counter 'j' to 0.
    j = 0
    ;
    /*
     * The loop condition involves reading input:
     * 1. Use 'require("fs")' to get the file system module.
     * 2. 'readFileSync("/dev/stdin", "utf8")' reads the entire standard input as a UTF-8 string.
     * 3. '.split(/\s/)' splits the string by any whitespace character, creating an array of strings.
     * 4. '[j++]' accesses an element from this array at index 'j', then increments 'j' for the next iteration.
     * 5. The retrieved element is assigned to 'i'. The loop continues as long as 'i' is a truthy value (i.e., an actual number string).
     */
    i = require  ( "fs" )  .  readFileSync  (  "/dev/stdin"  ,  "utf8"  )  .  split  (  /\s/  )  [  j ++  ]
    ;
)
{
    // This block executes for each input number 'i'.

    // Declare and initialize variables for the inner loop:
    // 'r' accumulates the result for the current 'i'.
    // 'k' is the inner loop counter, starting at 10.
    for  (
        r = 0
        ,   k = 10
        ;
        /*
         * Inner loop condition: 'k--' decrements 'k' before each check.
         * The loop runs 10 times, with 'k' taking values from 10 down to 1.
         */
        k --
        ;
        /*
         * This is the 'increment' part of the inner loop, but it performs calculations:
         * It's a ternary operation modifying 'i'.
         * If 'k' is odd (k % 2 is non-zero), 'i' is multiplied by 2.
         * Otherwise (if 'k' is even), 'i' is divided by 3.
         */
        k % 2  ?  i *= 2  :  i /= 3
    )
    {
        // Add the current value of 'i' to 'r'.
        // The unary '+' operator before 'i' ensures 'i' is treated as a number.
        r  +=  +  i
        ;
    }

    /*
     * After the inner loop completes its 10 iterations,
     * print the final accumulated result 'r' for the current input 'i'.
     * 'toFixed(8)' formats the number to exactly 8 decimal places.
     */
    console  .  log  (
        r  .  toFixed  (  8  )
    )
    ;
}
// End of the script. No further operations.