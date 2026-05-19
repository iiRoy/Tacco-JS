// Application configuration settings.
// These parameters define how the program interacts with its environment.
const appSettings = {
    // Specifies the input source. In this case, it's standard input.
    // This property name is critical for external API calls and should not be altered.
    input: '/dev/stdin',
    // Defines the character sequence used to denote a new line in the input.
    // This property name is also critical for string manipulation and should remain unchanged.
    newline: '\n'
};

// Retrieve the first set of data from the specified input source.
// The 'fs' module is used to read the file synchronously.
// The content is decoded as UTF-8 and then split into an array using the defined newline character.
// The variable 'valueA' will hold the result of this operation.
const valueA = require('fs').readFileSync(appSettings.input, 'utf8').split(appSettings.newline);

// Retrieve the second set of data from the same input source.
// This operation mirrors the first, reading from '/dev/stdin' again.
// The variable 'valueB' will store the outcome.
const valueB = require('fs').readFileSync(appSettings.input, 'utf8').split(appSettings.newline);

// Declare a mutable variable to serve as a temporary holder.
// This variable will be used for swapping values or storing intermediate results
// during calculations, such as remainders in the Euclidean algorithm.
let temporaryStorage;

// Conditional block to ensure that 'valueA' is greater than or equal to 'valueB'.
// This is a common preprocessing step for the Euclidean algorithm to simplify its logic.
if (valueA < valueB) {
    // If 'valueA' is smaller, perform a swap operation.
    // First, store the current 'valueA' in 'temporaryStorage'.
    temporaryStorage = valueA;
    // Then, assign 'valueB' to 'valueA'.
    valueA = valueB;
    // Finally, assign the original 'valueA' (now in 'temporaryStorage') to 'valueB'.
    valueB = temporaryStorage;
}

// Begin the iterative process of the Euclidean algorithm to compute the greatest common divisor (GCD).
// The loop continues as long as the remainder of 'valueA' divided by 'valueB' is not zero.
// The remainder is simultaneously calculated and assigned to 'temporaryStorage'.
while ((temporaryStorage = valueA % valueB) !== 0) {
    // Update 'valueA' to the current 'valueB'.
    valueA = valueB;
    // Update 'valueB' to the remainder that was just calculated and stored in 'temporaryStorage'.
    valueB = temporaryStorage;
}

// After the loop terminates, 'valueB' holds the greatest common divisor of the original two numbers.
// Print this final result to the console.
console.log(valueB);
