/*
 * This JavaScript program reads numerical inputs from standard input,
 * processes each number through a specific iterative calculation,
 * and then outputs the final computed value formatted to a fixed
 * number of decimal places.
 *
 * The code is intentionally written in a compact style in its original form,
 * but this version expands it with extensive whitespace and comments
 * to illustrate a Type I code clone, where only formatting and comments differ.
 */

// The main program logic is contained within a single, outer 'for' loop.
// This loop is responsible for reading input elements one by one
// and initiating the calculation for each.
for (
    // Initialization of the loop counter 'j'.
    // 'j' is used to index into the array of input values.
    j = 0;

    // This is the combined condition and update expression for the outer loop.
    // It reads the entire content of '/dev/stdin' (standard input),
    // decodes it as UTF-8, then splits the content into an array of strings
    // using any whitespace character as a delimiter.
    // The element at the current index 'j' is retrieved and assigned to 'i'.
    // The post-increment operator 'j++' ensures 'j' is incremented
    // immediately after its value is used for array access.
    // The loop continues as long as the assignment to 'i' results in a truthy value
    // (i.e., as long as there are input elements to process).
    i = require("fs").readFileSync("/dev/stdin", "utf8").split(/\s/)[j++];

    // The third part of the 'for' loop (the final-expression) is omitted here
    // because the increment of 'j' is already handled within the condition.
) {
    // Start of the outer loop's body.
    // This block executes for each valid input number 'i'.

    // An inner 'for' loop performs the core calculation on the current 'i'.
    for (
        // Inner loop initialization:
        // 'r' is initialized by converting 'i' to a number using the unary plus operator.
        // 'k' is initialized to 10, serving as the counter for this inner loop.
        r = +i,
        k = 10;

        // Inner loop condition:
        // The pre-decrement operator '--k' decrements 'k' before checking the condition.
        // The loop continues as long as 'k' is greater than 0 (i.e., truthy).
        --k;

        // Inner loop final expression (update):
        // This is a ternary operator that modifies the value of 'i' based on 'k''s parity.
        // If 'k' is odd (k % 2 results in a non-zero, truthy value), 'i' is multiplied by 2.
        // Otherwise (if 'k' is even), 'i' is divided by 3.
        k % 2 ? i *= 2 : i /= 3
    ) {
        // Body of the inner loop:
        // The current value of 'i' (which is modified in each iteration) is added to 'r'.
        r += i;
    } // End of the inner 'for' loop.

    // After the inner loop completes (9 iterations),
    // the accumulated result 'r' is printed to the console.
    // 'toFixed(8)' formats the number to a string with exactly 8 decimal places.
    console.log(r.toFixed(8));

} // End of the outer 'for' loop.

// The script finishes execution once all input elements have been processed.