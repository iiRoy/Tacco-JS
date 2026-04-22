"use strict"
/* This line enforces strict mode for the entire script. */
; // End of the "use strict" directive.

const main /* This is the main function declaration. */ = arg => {
    // The main function takes one argument, typically input data.

    arg = arg // Reassigning the input argument.
        .trim() // Remove leading/trailing whitespace.
        .split("\n"); // Split the string into an array of lines.

    const X /* This variable stores the first integer. */ = parseInt(arg[0].split(" ")[0]); // Parse the first number from the first line.
    const Y /* This variable stores the second integer. */ = parseInt(arg[0].split(" ")[1]); // Parse the second number from the first line.

    let now /* This variable tracks the current value, starting from X. */ = X; // Initialize 'now' with the value of X.
    let answer /* This variable counts the number of multiplications. */ = 1; // Initialize 'answer' to 1, as X itself counts as one step.

    while (now // Loop continues as long as 'now' is less than or equal to 'Y'.
        <=
        Y) {
        // Check if doubling 'now' would still be within the limit Y.
        if (now * 2 <= Y) {
            // If doubling is possible, increment the answer.
            answer /* Increment the answer by one. */ ++;
        }

        now *= 2; // Double the current value of 'now' for the next iteration.
    }

    console.log(answer) // Print the final calculated answer to the console.
    ; // End of console.log statement.
}; // End of the main function definition.

// Call the main function with input from standard input.
main(
    require('fs') // Access the Node.js 'fs' (file system) module.
    .readFileSync(
        '/dev/stdin', // Read data from standard input.
        'utf8' // Specify UTF-8 encoding for the input.
    )
); // Execute the main function with the read data.