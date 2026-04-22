/*
 * This is a Type I clone of an existing JavaScript program.
 * It strictly adheres to the official definition:
 * - All identifiers, variable names, function names, operators, and expressions
 *   are kept precisely as they were in the original code.
 * - Only whitespace (spaces, tabs, newlines) and comments are altered.
 * The purpose is to demonstrate a visually different but semantically identical
 * code structure, highlighting permitted variations under Type I cloning.
 */
'use strict' // Enforces strict mode for cleaner code and fewer errors.

// The primary function of this program, named 'main'.
// It takes a single string argument 's' as input.
function main(s) {

    // Process the input string 's' to extract numerical values.
    // 1. Split the string by newline characters and take the first line.
    // 2. Split that first line by space characters.
    // 3. Map each resulting string part to a Number.
    s = s.split('\n')[0] .split(' ') .map(n => Number(n));

    // Assign the numerical values from the processed array to constants A, B, and C.
    const A = s[0]; // The first number from the input.
    const B = s[1]; // The second number from the input.
    const C = s[2]; // The third number from the input.

    // Initialize a new Set object. This set will store unique modulo results.
    let modSet = new Set();

    // Begin a loop that iterates from 'i' equals 0 up to (A * B), inclusive.
    // The loop variable 'i' is incremented by 1 in each iteration.
    for ( let i = 0; i <= A * B; i ++ ) {
        // Calculate the modulo of (A * i) by B, and add this result to the 'modSet'.
        // Sets automatically handle uniqueness, so duplicate values are not added.
        modSet.add((A * i) % B);
    }

    // Determine the final answer based on whether 'C' is present in 'modSet'.
    // If 'modSet' contains 'C', the answer is 'YES'; otherwise, it's 'NO'.
    const answer = modSet.has(C) ? 'YES' : 'NO';

    // Output the calculated 'answer' to the console.
    console.log(answer);
}


// This line executes the 'main' function.
// It reads input from standard input (/dev/stdin) using Node.js's 'fs' module.
// The input is expected to be encoded in UTF-8.
main( require("fs").readFileSync("/dev/stdin", "utf8") );

/*
 * End of the JavaScript program.
 * All logic and structure remain identical to the original.
 */