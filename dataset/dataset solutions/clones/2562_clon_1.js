/*
 * This is a Type I clone of an original JavaScript program.
 * It strictly adheres to the definition, ensuring all functional
 * elements remain identical, with only changes to whitespace and comments.
 */
'use strict'; // Enforce strict mode for cleaner code execution.


const main = input => { // Define the primary function that processes the given input array.

    // The first line of input (input[0]) contains two space-separated integers: n and m.
    // Parse the first integer as 'n'.
    const n = parseInt(input[0].split(' ')[0], 10);

    /*
     * Parse the second integer from the first line as 'm'.
     * The radix 10 is explicitly provided for parseInt for best practice.
     */
    const m = parseInt(input[0].split(' ')[1], 10);

    // The second line of input (input[1]) contains a list of space-separated integers.
    // These are parsed into an array of numbers named 'a'.
    let a = input[1].split(' ').map(val => parseInt(val, 10));


    // This loop performs a specific operation 'm' times.
    for (let i = 0; i < m; i++) {
        // In each iteration, find the index of the maximum value currently in array 'a'.
        // Math.max.apply(null, a) finds the maximum element in 'a'.
        // a.indexOf() then returns the index of the first occurrence of that maximum value.
        let x = a.indexOf(Math.max.apply(null, a));

        // Halve the value at the found index 'x', rounding down to the nearest integer.
        a[x] = Math.floor(a[x] / 2);
    } // End of the main processing loop.


    // After all operations, calculate the sum of all elements remaining in array 'a'.
    // The reduce method is used to accumulate the sum.
    console.log(a.reduce((ans, data) => ans + data));

}; // End of the 'main' function definition.


/*
 * This section handles reading the input from standard input (/dev/stdin),
 * processing it, and then passing it to the 'main' function for execution.
 */
main(
    require("fs")
        .readFileSync("/dev/stdin", "utf8") // Read the entire content of stdin as a UTF-8 string.
        .split('\n') // Split the string content into an array of lines, based on newline characters.
);