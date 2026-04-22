/*
 * This JavaScript code snippet performs a calculation and then prints a result.
 * It is designed to be concise and uses a single-line structure in its original form.
 */

// Define and execute a for loop.
// The initialization part of the loop performs two assignments, separated by a comma:
// 1. 's' is initialized to 1. This variable will accumulate a product.
// 2. 'i' is initialized by reading content from standard input (/dev/stdin).
//    The 'fs' module is used to synchronously read the file, interpreting its content as UTF-8.
//    The value read from stdin is expected to be a number (as a string), which will be
//    implicitly converted to a number when used in the loop condition.
//
// The loop condition is 'i--'. This means:
//    - The current value of 'i' is evaluated for truthiness (non-zero is truthy).
//    - After evaluation, 'i' is decremented by 1.
//    The loop continues as long as 'i' (before decrement) is a truthy value.
//
// The loop's increment/final-expression part is empty.
for (
    s = 1,
    i = require("fs").readFileSync("/dev/stdin", "utf8"); // Initialize 's' and 'i'
    i--;                                                    // Loop condition: check 'i', then decrement 'i'
) {
    // The body of the loop consists of a single statement.
    // 's *= i' is shorthand for 's = s * i'.
    // This multiplies the current value of 's' by the current value of 'i' (before its next decrement)
    // and stores the result back into 's'.
    s *= i;
}

// After the loop has completed:
// The loop terminates when 'i' (before decrement) evaluates to a falsy value (typically 0).
// At that point, 'i' is decremented one last time, resulting in 'i' being 0.
// This statement prints the final value of 'i' to the console.
// Note: It prints 'i' (which will be 0), not the calculated product 's'.
console.log(i);

// End of the JavaScript program.