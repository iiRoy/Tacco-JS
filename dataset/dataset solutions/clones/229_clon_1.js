/*
 * This JavaScript program processes numbers from standard input.
 *
 * It reads each whitespace-separated number, performs a specific calculation,
 * and then outputs the result to the console.
 *
 * The calculation performed is: (n*n + n + 2) / 2, where 'n' is the input number.
 */
for (
    // Initialize the loop counter 'j' to zero.
    // This variable is used as an index to access elements from the input array.
    j = 0;

    // This is the loop condition and the main processing step.
    // It reads the entire content of standard input, splits it by whitespace,
    // and then takes the element at index 'j'.
    // The unary '+' operator converts the string element to a number.
    i = +require("fs") // Load the Node.js 'fs' (file system) module.
        .readFileSync(
            // Read the entire content of the specified file.
            "/dev/stdin", // Standard input path on Unix-like systems.
            "utf8"        // Specify UTF-8 encoding for reading the file.
        )
        .split(
            // Split the read content into an array of strings.
            /\s/ // Split by any whitespace character (spaces, tabs, newlines).
        )[
            // Access the element at the current index 'j' from the split array.
            // After accessing, increment 'j' for the next iteration.
            j++
        ];

    // The loop body is executed as long as 'i' is a valid number (not NaN or undefined after conversion,
    // which effectively ends when the split array runs out of elements or a non-numeric string is encountered).
) {
    // Inside the loop, perform the calculation and print the result.
    console.log(
        // Output the calculated value to the standard output.
        (
            i * i + // Square the current input number 'i'.
            i +     // Add 'i' itself to the squared value.
            2       // Add a constant value of 2.
        ) / 2       // Divide the entire sum by 2 to get the final result.
    );
}