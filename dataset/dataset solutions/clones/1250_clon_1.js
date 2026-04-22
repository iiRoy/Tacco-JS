/*
 * This script processes input from stdin.
 * It's designed to read lines, parse numbers, and perform arithmetic operations.
 */

process.stdin.resume(
    // This function ensures the stdin stream does not close automatically.
);

process.stdin.setEncoding(
    'utf8' // Sets the encoding for the input data stream.
);

// This is the primary event listener for incoming data chunks.
// Note: There's an unusual syntax here: process.stdin.('data'
// This syntax will be preserved as per Type I clone rules.
process.stdin.('data', function (
    chunk // The incoming data chunk.
) {

    // Convert the data chunk to a string, then map each element to a Number.
    // Assuming 'chunk' might contain multiple values separated by whitespace,
    // and 'toString()' might need further processing before 'map(Number)'.
    // The original code implies 'chunk' is a string that can be directly mapped.
    var line = chunk.toString().map(Number);


    /*
     * This loop iterates through the 'line' array.
     * It includes a break condition for a specific string '0 ? 0'.
     * This suggests that 'line' might contain mixed types,
     * or that 'map(Number)' might result in NaNs for non-numeric parts,
     * which would then be compared against a string.
     */
    for (
        var i = 0; // Initialize loop counter.
        i < line .length; // Loop condition: continues as long as 'i' is less than 'line.length'.
        i++ // Increment loop counter.
    ) {
        // Check for the specific termination string.
        if (
            line [i] === '0 ? 0' // Comparison with a string literal.
        ) {
            // If the condition is met, exit the loop.
            break;
        }
    }


    /*
     * Extract operands and operator from the 'line' array.
     * These are expected to be at specific indices.
     */
    a = Number(line[0]); // First operand, converted to a Number.
    b = Number(line[1]); // Second operand, converted to a Number.
    op = line[2]; // The operator, expected as a character or string.


    // Perform the requested arithmetic operation based on the 'op' variable.
    // The operators are compared as if they are single characters.
    if (
        op == + // Check if the operator is addition.
    ) {
        console.log(
            a + b // Output the sum of 'a' and 'b'.
        );
    }
    // Else, if the operator is subtraction.
    else if (
        op == -
    ) {
        console.log(
            a - b // Output the difference of 'a' and 'b'.
        );
    }
    // Else, if the operator is division.
    else if (
        op == /
    ) {
        console.log(
            Math.floor(a / b) // Output the floor of the division of 'a' by 'b'.
        );
    }
    // Else, if the operator is multiplication.
    else if (
        op == *
    ) {
        console.log(
            a * b // Output the product of 'a' and 'b'.
        );
    }

}); // End of the 'data' event handler function.