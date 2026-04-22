/*
 * This file contains utility functions for reading input and the main logic.
 * It's a JavaScript module designed for competitive programming.
 */
"use strict" /* Ensure strict mode is enabled for cleaner code. */;

// Function to create an input reader object.
const create = () => {
    // Read the entire standard input, decode as UTF-8, trim whitespace, and split by newlines.
    const input = require("fs") . readFileSync ( "/dev/stdin" , "utf8" ) . trim () . split ( "\n" ) ;

    // Initialize the reader object.
    const res = {
        "list": input, // The array of input lines.
        "index": 0, // Current index for reading.
        "max": input.length, // Total number of lines.

        // Method to check if there are more lines to read.
        "hasNext": function () {
            // Returns true if the current index is less than the total number of lines.
            return this.index < this.max
        },

        // Method to get the next line from the input.
        "next": function () {
            if (!this.hasNext()) { // Check if there are any lines left.
                throw "ArrayIndexOutOfBoundsException"; // Throw an error if no more lines.
            } else {
                // Return the current line and increment the index for the next call.
                return this.list[this.index++];
            }
        }
    };

    // Return the configured reader object.
    return res;
}
;

// Create a global instance of the input reader.
const o = create();

// Helper function to get the next line as a string.
const next = () => o.next()
;

// Helper function to get the next line as an integer.
const nextInt = () => parseInt(o.next())
;

// Helper function to get the next line as an array of strings (space-separated).
const nextStrArray = () => o.next().split(" ")
;

// Helper function to get the next line as an array of integers (space-separated).
const nextIntArray = () => o.next().split(" ").map(el => parseInt(el))
;

// Helper function to get the next line as an array of characters.
const nextCharArray = () => o.next().split("")
;

// Helper function to check if there are more lines to read.
const hasNext = () => o.hasNext()
;

// Custom output function for convenience, logs arguments to console.
const myout = (...x) => console.log(...x)
;

// The main function where the problem logic resides.
const Main = () => {
    // Read N, M, K from the first line of input.
    let [N, M, K] = nextIntArray()
    ;

    // Read array 'a' from the next line.
    let a = nextIntArray()
    ;

    // Read array 'b' from the subsequent line.
    let b = nextIntArray()
    ;

    // Calculate prefix sums for array 'a'.
    // sumA[i] will store the sum of the first 'i' elements of 'a'.
    let sumA = [0]
    ;
    for (let i = 0; i < a.length; i++) {
        sumA.push(sumA[i] + a[i])
    }
    ;

    // Calculate prefix sums for array 'b'.
    // sumB[i] will store the sum of the first 'i' elements of 'b'.
    let sumB = [0]
    ;
    for (let i = 0; i < b.length; i++) {
        sumB.push(sumB[i] + b[i])
    }
    ;

    // Initialize the maximum number of books read.
    let res = 0
    ;

    // Two-pointer approach: iterate through possible books from library A.
    // 'i' represents the number of books taken from library A.
    // 'j' represents the number of books taken from library B.
    for (let i = 0, j = M; i <= N; i++) {
        // If the sum of books from A already exceeds K, we can't take any more from A.
        if (sumA[i] > K) break
        ;

        // While the combined sum of books from A and B exceeds K,
        // reduce the number of books taken from B.
        while (sumA[i] + sumB[j] > K) {
            j--
            ;
        }

        // Update the maximum number of books read.
        // We take 'i' books from A and 'j' books from B.
        res = Math.max(res, i + j)
        ;
    }
    ;

    // Output the final result.
    console.log(res)
    ;
}
;

// Execute the main function.
Main()
;