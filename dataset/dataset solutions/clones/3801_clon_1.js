/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions are preserved exactly.
 * Only whitespace and comments have been altered.
 */

"use strict"; // Enforce strict mode for cleaner code.

// The main function processes the input.
const main = arg => {

    // First, clean up the input string: trim whitespace and split by newlines.
    arg = arg.trim().split("\n");

    /*
     * Parse the first line to get the value of N.
     * It expects the first element of the first line, split by space.
     */
    const N = parseInt(arg[0].split(" ")[0]);

    // The second line contains the string A, split into an array of characters.
    const A = arg[1].split("");


    // Calculate the initial total count of 'E' characters in array A.
    const Rsum = A.filter(n => n === "E").length;

    /*
     * Calculate the initial total count of 'W' characters.
     * This is simply N (total length) minus Rsum (total 'E's).
     * Note: Lsum is calculated but not directly used in the loop,
     * but it's part of the original logic, so it's kept.
     */
    const Lsum = N - Rsum;

    // Initialize counters for 'R' (Right/East) and 'L' (Left/West) encountered so far.
    let Rcnt = 0; // Count of 'E' characters seen to the left of the current position.
    let Lcnt = 0; // Count of 'W' characters seen to the left of the current position.

    // Initialize the answer with a very large number (Infinity) to find the minimum later.
    let answer = Infinity;


    // Iterate through the array A from left to right.
    for (let i = 0; i < N; i++) {

        // --- Calculate movements needed for the left part ---
        // 'W' characters to the left of the current position need to move to the right.
        const needMoveLeft = Lcnt;


        // --- Calculate movements needed for the right part ---
        /*
         * 'E' characters to the right of the current position need to move to the left.
         * This is calculated as the total 'E's (Rsum) minus 'E's already processed (Rcnt).
         */
        let needMoveRight = Rsum - Rcnt;

        // If the current character is 'E', it means it's part of the 'right' section
        // *before* the current position, so it shouldn't be counted for 'needMoveRight'.
        if (A[i] === "E") {
            needMoveRight--; // Decrement as the current 'E' is not a 'right' E for *this* split.
        }

        // Update the minimum answer: sum of movements from both sides.
        answer = Math.min(answer, needMoveLeft + needMoveRight);


        // Update the counts based on the current character for the next iteration.
        if (A[i] === "W") {
            Lcnt++; // Increment count of 'W's encountered.
        } else {
            Rcnt++; // Increment count of 'E's encountered.
        }
    }

    // Output the final minimum answer.
    console.log(answer);
};

/*
 * Read the input from standard input using Node.js 'fs' module.
 * The input is read synchronously and decoded as UTF-8.
 * Then, the main function is called with this input.
 */
main(require('fs').readFileSync('/dev/stdin', 'utf8'));