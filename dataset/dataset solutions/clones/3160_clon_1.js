'use strict' /* This directive enforces strict mode for the entire script. */

/*
 * This block of code represents an alternative, commented-out implementation
 * of the main function. It uses a different algorithmic approach involving
 * array manipulation (splicing) and set operations to solve a problem.
 *
 * const main = (input) => {
 *     let arr = input.split('\n')[0].split('')
 *     let ans = 0
 *
 *     while (true) {
 *         for(let i = 0; i < arr.length - 1; i++) {
 *             if (arr[i] !== arr[i + 1]) {
 *                 arr.splice(i, 2) // Remove two elements
 *                 ans += 2         // Increment answer
 *             }
 *         }
 *
 *         let set = new Set(arr) // Create a set from the array
 *         if (set.size < 2) {    // If only one unique element remains (or none)
 *             console.log(ans)
 *             return             // Exit the function
 *         }
 *     }
 * }
 */

// The primary function definition for processing the input string.
const main = (input) => {

    // Split the input string by newline, take the first line, then split into an array of characters.
    let arr = input .split('\n')[0].split('');

    // Initialize counters for '0's and '1's.
    let count0 = 0;
    let count1 = 0;

    // Iterate over each character in the array.
    arr.forEach(v => {
        // If the character is '0', increment count0.
        if ( v === '0' ) {
            count0++;
        }
        // If the character is '1', increment count1.
        if ( v === '1' ) {
            count1++;
        }
    }); // End of forEach loop.


    // The problem logic determines the answer by finding the minimum of count0 and count1,
    // and then multiplying by 2. This effectively counts pairs that can be removed.
    console.log( Math.min(count0, count1) * 2 );

}; // End of the main function definition.


// This line reads input from standard input, converts it to UTF-8,
// and then passes it to the 'main' function for processing.
main( require('fs').readFileSync('/dev/stdin', 'utf-8') );