/*
 * This JavaScript code reads numerical input from standard input,
 * processes each number, and then prints a space-separated sequence
 * of powers of two that constitute the binary representation of that number,
 * up to the 2^9 (512) bit.
 *
 * It's structured in a highly compact and somewhat unconventional way,
 * using the loop's initialization, condition, and final expressions
 * to perform significant operations.
 */


// The outer 'for' loop iterates through each number provided in the standard input.
// Its structure is quite unique, packing initialization, input reading,
// and output logging into the loop's control expressions.
for (
    // Initialization: 'j' serves as an index for parsing the input array.
    // It's set to 0 to start from the beginning of the input.
    j = 0;

    // Condition: This is a multi-purpose expression.
    // 1. It reads the entire standard input using 'fs.readFileSync'.
    // 2. It decodes the input as UTF-8.
    // 3. It splits the input string by any whitespace character into an array of strings.
    // 4. It then accesses the element at index 'j' from this array.
    // 5. Immediately after accessing, 'j' is incremented using the post-increment operator 'j++'.
    // 6. The result of this array access (the current input number as a string) is assigned to 'i'.
    // 7. The loop continues as long as 'i' is a truthy value (i.e., not undefined, null, or empty string, which would signify end of input).
    i = require("fs").readFileSync("/dev/stdin", "utf8").split(/\s/)[j++];

    // Final Expression: Executed after each iteration of the outer loop (after the inner loop completes).
    // It prints the accumulated string 'a' to the console.
    // The '.trim()' method ensures that any trailing space (added by the inner loop) is removed.
    console.log(a.trim())
) {
    // Body of the outer loop: This is where the core processing for each input number 'i' happens.
    // It contains an inner 'for' loop that analyzes the bits of 'i'.

    // Reset the string accumulator 'a' for each new input number 'i'.
    // This ensures that the output for the current 'i' starts fresh.
    a = '';

    // The inner 'for' loop iterates to check the first 10 bits of the number 'i'.
    // It effectively checks for powers of 2 from 2^0 (1) up to 2^9 (512).
    for (
        // Initialization: 'k' serves as the bit position counter, starting from 0.
        k = 0;

        // Condition: The loop continues as long as 'k' is less than 10.
        // '10 - k' evaluates to a non-zero (truthy) value for k from 0 to 9.
        // When k becomes 10, '10 - 10' is 0 (falsy), terminating the loop.
        10 - k;

        // Final Expression: Increment 'k' after each inner loop iteration
        // to move to the next bit position.
        k++
    ) {
        // Body of the inner loop: This is where the bitwise check and string building occur.

        // Calculate the current power of 2 (2 raised to the power of 'k').
        // This value is assigned to 'n'.
        n = 1 << k;

        // Ternary operator: Checks if the 'k'-th bit of 'i' is set.
        // '(n & i)' performs a bitwise AND operation. If the 'k'-th bit of 'i' is 1,
        // then '(n & i)' will be equal to 'n' (a non-zero truthy value).
        // If the bit is 0, '(n & i)' will be 0 (a falsy value).
        (n & i)
            ? // If the bit is set (condition is truthy):
              // Append the power of 2 ('n') followed by a space to the string 'a'.
              a += n + ' '
            : // If the bit is not set (condition is falsy):
              // Do nothing. '0' is a valid statement in JavaScript that has no effect.
              0;
    }
}