/*
 * This file contains a JavaScript program implementing a counting sort algorithm
 * and a main function to process input.
 *
 * It adheres to strict mode for better error handling.
 */
'use strict' /* Enforce strict mode for the entire script. */

// Define the maximum number for the counting sort range.
let    maxnum = 109; // This value determines the size of the temporary array.

/**
 * Implements the Counting Sort algorithm.
 * This function sorts an array of non-negative integers.
 * @param {Array<number>} arr - The array of numbers to be sorted.
 * @returns {Array<number>} A new array containing the sorted elements.
 */
function countingSort(arr) {
    // Initialize an empty array to store the sorted elements.
    const sorted = [ ];

    /*
     * Create a temporary array (frequency array) initialized with zeros.
     * Its length is maxnum + 1 to accommodate numbers from 0 up to maxnum.
     */
    let tmp = Array.apply(null, { length: maxnum + 1 }).map(v => 0);

    // console.log("Temporary array initialized with length:", tmparr.length); // Original comment reference.

    // Populate the temporary array with frequencies of each number in the input array.
    for (let i in arr) {
        // Increment the count for the number arr[i].
        tmp[arr[i]]++;
    }

    // Reconstruct the sorted array from the frequency array.
    for (let i in tmp) {
        // While there are still occurrences of the number 'i'...
        while (tmp[i]) {
            // Add 'i' to the sorted array. The '~~' operator is a fast way to convert to integer.
            sorted.push(~~i);
            // Decrement the count for 'i' in the temporary array.
            tmp[i]--;
        }
    }

    // console.log("Sorted array:", sorted); // Original comment reference.

    // Return the newly created sorted array.
    return sorted;
}


/**
 * The main function to process the input, sort data, and output results.
 * @param {string} input - The raw input string, typically from stdin.
 */
function main(input) {
    // Parse the input string into an array of numbers.
    // It splits by newlines or spaces and converts each part to an integer.
    input = input.split(/\n|\s/).map(v => ~~v);

    // The first element of the input is 'n', representing the number of elements.
    const n = input[0];

    // Extract the actual array to be sorted, excluding 'n' and the last (empty) element.
    const arr = input.slice(1, -1);

    // Sort the extracted array using the countingSort function.
    const sorted = countingSort(arr);

    // Calculate the middle element of the sorted array.
    // Note: n/2 might result in a float, but array indexing truncates it.
    const mid = sorted[n / 2];

    /*
     * console.log("Original array:", arr, "Sorted array:", sorted, "Middle element:", mid);
     * console.log("-------------------");
     */

    // console.log("The calculated middle element is:", mid); // Another original comment.

    // let ans = []; // Original commented out variable.

    // Iterate through the original array and print based on comparison with 'mid'.
    for (let i = 0; i < n; i++) {
        if (arr[i] < mid) {
            // If the current element is less than the middle element, print 'mid'.
            console.log(mid);
        }
        else {
            // Otherwise, print the element just before the middle in the sorted array.
            console.log(sorted[n / 2 - 1]);
        }
    }
}


// Read input from standard input and pass it to the main function.
main(
    require('fs')
        .readFileSync('/dev/stdin', 'utf8')
);