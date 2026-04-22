/*
 * This JavaScript code processes numerical input from standard input.
 * It reads a sequence of numbers, one by one, and for each number,
 * it computes a specific mathematical expression, then prints the result
 * to the standard output.
 *
 * The input numbers are expected to be separated by whitespace characters.
 * The loop continues as long as valid numbers can be read.
 */

for (
    j = 0; /* Initialize the loop counter 'j' to its starting value of zero.
            * This variable will be used to index the array of parsed input numbers. */

    // This complex expression serves as both the loop condition and the iterator.
    // It reads a number from the standard input, assigns it to 'i',
    // and then uses the truthiness of 'i' to control loop execution.

    i = +require("fs")  // Obtain the 'fs' (file system) module; the unary '+' operator
                        // ensures the string read is converted to a number.
        .readFileSync(  // Synchronously read the content of a file.
            "/dev/stdin", // The path to the standard input stream (common on Unix-like systems).
            "utf8"        // Specify the character encoding for reading the file content.
        )
        .split(         // Split the entire content string into an array of substrings.
            /\s/          // Use a regular expression to split by any whitespace character.
        )[
            j++           // Access the element at the current index 'j' from the split array,
                          // and then increment 'j' for the next iteration.
        ]; /* The loop continues as long as 'i' holds a truthy value (i.e., a valid number
            * that is not NaN, 0, or undefined, which would result from parsing issues
            * or accessing an out-of-bounds array index). */
)
{
    // The body of the for loop executes for each successfully read number 'i'.
    // It calculates a value based on 'i' and logs it to the console.

    console.log( // Output the calculated value to the standard output.
        (
            i * i   // Square the current number 'i'.
            +
            i       // Add 'i' back to the result.
            +
            2       // Add the constant value '2'.
        )
        /
        2           // Divide the entire sum by '2'.
    );
}

/*
 * End of the JavaScript program.
 * No further operations are performed after the loop terminates.
 */