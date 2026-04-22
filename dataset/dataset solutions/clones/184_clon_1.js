/* This JavaScript file demonstrates a Type I code clone.
 * It is functionally identical to the original,
 * but features extensive whitespace and comment modifications
 * to achieve visual distinctiveness.
 */

// Declare and initialize the primary accumulation variables.
// 't' and 's' are set to zero at the start.
t = s = 0;


/*
 * The following statement reads input from standard input.
 * It uses Node.js's 'fs' module to perform synchronous file reading.
 * The content is then split into an array 'i' using a regular expression
 * that matches either whitespace characters or commas as delimiters.
 */
i = require("fs")
  .readFileSync(
    "/dev/stdin", // Path to standard input
    "utf8"        // Encoding to use for reading the file
  )
  .split(
    /\s|,/        // Regular expression to split by whitespace or comma
  )
; // End of the input processing statement.


/*
 * This is a 'for' loop that iterates through the 'i' array.
 * It processes the array elements in reverse order.
 *
 * Initialization:
 * 'a' is set to 'i.length - 1', storing the initial last index.
 * 'j' is also set to 'i.length - 1' and acts as the loop's counter.
 *
 * Condition and Iteration:
 * The loop continues as long as 'j--' evaluates to a truthy value (i.e., j >= 0).
 * 'j' is decremented after each evaluation of the condition.
 */
for (
  a = j = i.length - 1; // Initialize 'a' and 'j' with the last valid index.
  j--;                  // Loop while 'j' is non-negative, decrementing 'j' each time.
) {
  // The loop body contains a single statement using the comma operator.
  // This statement performs two main operations:
  // 1. It assigns a numeric value from the array to 'b' and adds it to 's'.
  // 2. It multiplies 'b' by another array value and adds it to 't'.

  s += ( // Accumulate into 's'.
    b = +i[j--] // Assign numeric value of current i[j] to 'b', then decrement 'j' for the next access.
  )
  , // The comma operator ensures these two expressions are part of the same statement.
  t += b * i[j] // Multiply 'b' by the *new* i[j] (after previous decrement) and accumulate into 't'.
  ; // End of the comma-separated statement.
}


/*
 * Finally, the calculated results are printed to the console.
 * The output consists of two values, separated by a newline character.
 *
 * First value: The final accumulated value of 't'.
 * Second value: A calculation involving 's', 'a', and rounding.
 *   - 's' is divided by (a * 2).
 *   - 0.5 is added for rounding.
 *   - '~~' (double bitwise NOT) is used to truncate the result to an integer.
 */
console.log(
  t                               // The first part of the output string.
  + '\n'                          // Concatenate a newline character.
  + ~~(s / (a * 2) + 0.5)         // The second part of the output string, after calculation and truncation.
);

// End of the Type I cloned code example.