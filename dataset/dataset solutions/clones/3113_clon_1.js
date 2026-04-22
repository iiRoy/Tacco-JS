'use strict' /* This directive enables strict mode for the entire script. */

// Define the main class that encapsulates the problem-solving logic.
class Main {
    // The primary method to execute the solution.
    solve() {
        // Read the first integer from the input array.
        let n = input.nextIntArr()[0];

        // Initialize an array to store pairs.
        const pairs = [];

        // If 'n' is odd, add it as a single-element pair.
        if (n % 2) {
            pairs.push([n]);
        }

        // Determine 'm' based on 'n' being odd or even.
        let m = n % 2 ? n - 1 : n;

        // Loop to generate pairs for even numbers.
        for (let i = 0; i < m / 2; ++i) {
            pairs.push([i + 1, m - i]);
        }

        // Initialize an empty array to store the final result.
        let ret = [];

        // Iterate through the generated pairs to combine them.
        for (let i = 0; i < pairs.length; ++i) {
            // For each element in the current pair, combine it with elements from the next pair (circularly).
            pairs[i].forEach((e1) => {
                ret = ret.concat(pairs[(i + 1) % pairs.length].map((e2) => [e1, e2]));
            });
        }

        // Output the total count of the combined results.
        console.log(ret.length);
        // Output each combined pair, joined by a space, with each pair on a new line.
        console.log(ret.map((e) => e.join(' ')).join('\n'));
    }
}

// Define the Input class to handle reading data from standard input.
class Input {
    // Constructor initializes the cursor and reads all input data.
    constructor() {
        this.cursor = 0; // Initialize cursor for tracking current line.
        this.inputAll(); // Read all data from stdin.
    }

    // Reads all lines from standard input and stores them.
    inputAll() {
        // Use Node.js 'fs' module to read from /dev/stdin.
        this.data = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
        return this.data; // Return the raw data array.
    }

    /*
     * nextLine method:
     * Reads a specified number of lines or just the next line.
     * @param {number} [n] - Optional number of lines to read.
     * @returns {string|string[]} - The line(s) read.
     */
    nextLine(n) {
        if (n) { // If 'n' is provided, read 'n' lines.
            const ret = this.data.slice(this.cursor, this.cursor + n);
            this.cursor += n; // Advance the cursor.
            return ret;
        }
        // If 'n' is not provided, read just the next line.
        return this.data[this.cursor++];
    }

    /*
     * nextStrArr method:
     * Reads the next line and splits it into an array of strings.
     * @returns {string[]} - An array of strings.
     */
    nextStrArr() {
        return this.nextLine().split(' ');
    }

    /*
     * nextIntArr method:
     * Reads the next line, splits it, and maps elements to integers.
     * @returns {number[]} - An array of integers.
     */
    nextIntArr() {
        return this.nextStrArr().map((e) => parseInt(e));
    }

    /*
     * nextFloatArr method:
     * Reads the next line, splits it, and maps elements to floats.
     * @returns {number[]} - An array of floats.
     */
    nextFloatArr() {
        return this.nextStrArr().map((e) => parseFloat(e));
    }

    /*
     * nextIntLine method:
     * Reads 'n' lines and maps each to an integer.
     * @param {number} n - Number of lines to read.
     * @returns {number[]} - An array of integers.
     */
    nextIntLine(n) {
        return this.nextLine(n).map((e) => parseInt(e));
    }

    /*
     * nextFloatLine method:
     * Reads 'n' lines and maps each to a float.
     * @param {number} n - Number of lines to read.
     * @returns {number[]} - An array of floats.
     */
    nextFloatLine(n) {
        return this.nextLine(n).map((e) => parseFloat(e));
    }

    /*
     * nextStrRange method:
     * Reads 'n' lines, splitting each into an array of strings.
     * @param {number} n - Number of lines to read.
     * @returns {string[][]} - A 2D array of strings.
     */
    nextStrRange(n) {
        return this.nextLine(n).map((line) => line.split(' '));
    }

    /*
     * nextIntRange method:
     * Reads 'n' lines, splitting each and mapping elements to integers.
     * @param {number} n - Number of lines to read.
     * @returns {number[][]} - A 2D array of integers.
     */
    nextIntRange(n) {
        return this.nextLine(n).map((line) => line.split(' ').map((e) => parseInt(e)));
    }

    /*
     * nextFloatRange method:
     * Reads 'n' lines, splitting each and mapping elements to floats.
     * @param {number} n - Number of lines to read.
     * @returns {number[][]} - A 2D array of floats.
     */
    nextFloatRange(n) {
        return this.nextLine(n).map((line) => line.split(' ').map((e) => parseFloat(e)));
    }
}

// Create a new instance of the Input class to manage input operations.
const input = new Input();

// Create a new instance of the Main class and immediately call its 'solve' method.
(new Main()).solve();