"use strict";
// This directive enforces stricter parsing and error handling in the code.

/**
 * The main function to process the input and solve the problem.
 * It calculates the number of pairs (i, j) such that the sum of elements
 * from index i to j-1 (inclusive) is a multiple of M.
 * This is achieved by using prefix sums modulo M.
 * @param {string} input - The raw input string containing N, M, and array A.
 */
function Main(input)
{
    // Initialize an Inputer instance to facilitate parsing the input string.
    let cin = new Inputer(input);

    // Read the two integers N and M from the input stream.
    // N represents the number of elements in array A.
    // M is the modulus for the prefix sums.
    let N = cin.getInt(), M = cin.getInt();

    // Read an array of N integers, A, from the input.
    let A = cin.getIntArray(N);

    // Initialize a hash map (object in JavaScript) to store the frequencies
    // of prefix sums modulo M.
    let m = {}; /* This map will store {prefix_sum_mod_M: count}. */

    // Declare and initialize an array to store the prefix sums modulo M.
    // The size is N + 1 because SUM[0] will represent an empty prefix sum.
    let SUM = new Array(N + 1);

    // The prefix sum before any elements is 0.
    SUM[0] = 0;

    // Calculate all prefix sums modulo M.
    // SUM[i+1] will store (A[0] + A[1] + ... + A[i]) % M.
    for (let i = 0; i < N; i++) {
        // Ensure the result of the sum remains within the modulo M.
        SUM[i + 1] = (SUM[i] + A[i]) % M;
    }

    // Initialize the answer variable, which will count the valid pairs.
    let ans = 0;

    // Iterate through the array of prefix sums.
    // For each prefix sum, check how many times it has appeared before.
    for (let i = 0; i < SUM.length; i++) {

        // Get the current frequency of the prefix sum SUM[i] from the map 'm'.
        // If SUM[i] is not yet in 'm', its frequency is 0.
        let sum = m[SUM[i]] || 0; /* 'sum' here temporarily holds the frequency count. */

        // Add the retrieved frequency to the total answer.
        // If SUM[i] has appeared 'k' times before, it forms 'k' pairs with the current i.
        ans += sum;

        // Increment the frequency of the current prefix sum SUM[i] in the map 'm'.
        m[SUM[i]] = sum + 1; // Update the count for this specific prefix sum.
    }

    // Output the final calculated answer to the console.
    console.log(ans); // Display the total number of pairs.
} /* End of the Main function definition. */


/**
 * Helper class for parsing various types of input from a string.
 */
class Inputer {

    /**
     * Constructor for the Inputer class.
     * @param {string} input - The raw input string to be parsed.
     */
    constructor ( input ) {
        // Initialize a counter to keep track of the current item being read.
        this.cnt = 0;
        // Split the input string by newline characters or spaces into an array of individual items.
        this.items = input.split(/\n|\s/);
    }

    /**
     * Retrieves the next integer from the input stream.
     * @returns {number} The next integer.
     */
    getInt() {
        // Access the item at the current counter position, then increment the counter.
        // The '- 0' trick is a concise way to convert the string item to a number.
        return this.items[this.cnt++] - 0;
    }

    /**
     * Retrieves an array of N integers from the input stream.
     * @param {number} N - The number of integers to retrieve.
     * @returns {number[]} An array containing N integers.
     */
    getIntArray(N) {
        // Create a new array with the specified size N.
        let array = new Array(N);

        // Loop N times to populate the array by calling getInt() for each element.
        for (let n = 0; n < N; n++) {
            array[n] = this.getInt();
        }

        return array; // Return the fully populated array.
    }

    /**
     * Retrieves the next string from the input stream.
     * @returns {string} The next string.
     */
    getStr() {
        // Access the item at the current counter position, then increment the counter.
        return this.items[this.cnt++];
    }

    /**
     * Retrieves an array of N strings from the input stream.
     * @param {number} N - The number of strings to retrieve.
     * @returns {string[]} An array containing N strings.
     */
    getStrArray(N) {
        // Create a new array to store the strings.
        let array = new Array(N);

        // Loop N times to populate the array by calling getStr() for each element.
        for (let n = 0; n < N; n++) {
            array[n] = this.getStr();
        }

        return array; // Return the array of strings.
    }
} // End of Inputer class definition.


// This conditional block checks if the code is being run in a Node.js environment.
// 'typeof window == "undefined"' is a common way to detect Node.js (vs. browser).
if ( typeof window == "undefined" )
{
    // If in Node.js, read the input from standard input (typically /dev/stdin on Linux/macOS).
    // The 'fs' module is used for file system operations, and 'readFileSync' reads the file synchronously.
    // The input is expected to be UTF-8 encoded.
    Main(require("fs").readFileSync("/dev/stdin", "utf8"));
}