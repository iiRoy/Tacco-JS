/* This program processes numerical input data to calculate a specific value.
 * It's designed to read from standard input in a Node.js environment.
 * The core logic involves parsing, sorting, summing, and applying a mathematical formula. */
'use strict'; // Ensures that the code adheres to strict parsing and error handling rules.

/**
 * The main entry point of the application.
 * It takes a raw string input, processes it, and prints the result.
 * @param {string} input - The raw string data, typically read from stdin.
 */
function main(
    input // Parameter representing the entire input string.
) {

    // Step 1: Parse the input string into an array of numbers.
    // The input string is split by either newlines or spaces.
    // Each resulting substring is then converted into an integer using the bitwise NOT operator.
    input = input
        .split(
            /\n|\s/ // Regular expression to split by newline or any whitespace character.
        )
        .map(
            v => // Arrow function to transform each element.
            ~~v // Converts a string to an integer; equivalent to parseInt(v, 10) but faster for positive integers.
        );

    // Step 2: Extract specific values from the parsed input array.
    // 'q' is assumed to be the second element in the input array (index 1).
    const q = input[
        1
    ]; // Defines 'q' as a constant, representing a quantity or target value.

    // 'tmp' holds a slice of the input array, starting from the third element (index 2).
    // These elements are likely the individual items or components for a 'recipe'.
    const tmp = input
        .slice(
            2 // Start slicing from index 2 up to the end of the array.
        );

    // Step 3: Sort the 'tmp' array to create the 'recipe' array.
    // The sort order is ascending numerically.
    const recipe = tmp
        .sort(
            (a, b) => // Comparison function for sorting.
            a - b // Sorts numbers in ascending order.
        );

    // Step 4: Calculate the sum of all elements in the 'recipe' array.
    // The 'reduce' method iterates over the array, accumulating the total.
    const sum = recipe
        .reduce(
            (v, x) => // 'v' is the accumulator (current sum), 'x' is the current element.
            v + x // Adds the current element to the accumulated sum.
        );

    // Step 5: Compute the final answer 'ans' using a specific formula.
    // The formula involves 'q', the 'sum' of recipe items, the smallest recipe item (recipe[0]),
    // and the total number of recipe items (recipe.length).
    const ans =
        Math.floor( // Ensures the result of the division is an integer (floor division).
            (
                q - // The initial quantity.
                sum // Subtract the sum of all recipe items.
            ) / // Divide the remaining quantity by...
            recipe[0] // ...the smallest recipe item (which is at index 0 after sorting).
        ) + // Add to this result...
        recipe
        .length; // ...the total count of recipe items.

    // Step 6: Output the calculated answer to the console.
    console
        .log( // Prints the value of 'ans' followed by a newline.
            ans // The final computed answer.
        );
}

// This block ensures the 'main' function is called when the script is executed.
// It reads the entire content of standard input synchronously, using UTF-8 encoding,
// and passes it as a string to the 'main' function.
main(
    require("fs") // Accesses Node.js's built-in file system module.
    .readFileSync( // Synchronously reads the entire contents of a file.
        "/dev/stdin", // Specifies the file to read from, which is standard input in Unix-like systems.
        "utf8" // Defines the character encoding for the input file.
    )
);