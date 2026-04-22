/*
 * This file contains an implementation of sorting algorithms
 * and a stability check for a custom data structure.
 *
 * It reads input from standard input, processes it,
 * and then prints the results to standard output.
 */


//  Configuration object for input/output settings.
const config = {
    input   : '/dev/stdin', // Specifies the input source.
    newline : '\n'          // Defines the newline character to split lines.
};


// Read the entire input file, decode it as UTF-8, and split it into lines.
const line = require('fs')
    .readFileSync(config.input, 'utf-8')
    .split(config.newline);


// Parse the data from the second line of input.
// Each item is split by space, and then converted into a pair:
// [numeric_value, original_string_value].
const data = line[1]
    .split(' ')
    .map(x => [parseInt(x[1]), x]); // x[1] is the number part, x is the full string.


/**
 * Helper function for bubble sort: Swaps two adjacent elements if the first is
 * greater than the second based on their numeric value.
 * This is a recursive implementation that processes the first two elements
 * and then recursively calls itself for the rest of the array.
 * @param {Array<Array<number|string>>} arr - The array slice to process.
 * @returns {Array<Array<number|string>>} - The array slice with the first two elements potentially swapped.
 */
const bswap = arr => {

    // Base case: If the array has only one element, it's already "swapped".
    if (arr.length === 1) {
        return arr;
    }


    const f = arr[0]; // The first element.
    const s = arr[1]; // The second element.

    const tl = arr.slice(2); // The rest of the array (tail).


    // Compare the numeric values of the first two elements.
    if (f[0] > s[0]) {
        // If the first is greater, swap them and recursively process the rest.
        return [s, ...bswap([f, ...tl])];
    } else {
        // Otherwise, keep them in order and recursively process the rest.
        return [f, ...bswap([s, ...tl])];
    }
};


/**
 * Implements a recursive bubble sort algorithm.
 * It repeatedly calls bswap to "bubble" the largest element to the end
 * of the current sub-array.
 * @param {Array<Array<number|string>>} arr - The array to be sorted.
 * @returns {Array<Array<number|string>>} - The sorted array.
 */
const bsort = arr => {

    // Base case: An empty array is already sorted.
    if (arr.length === 0) {
        return [];
    }


    // Perform one pass of "bubbling" to move the largest element to its correct position.
    const swapped = bswap(arr);

    // The head contains all but the last element (which is now correctly placed).
    const hd = swapped.slice(0, swapped.length - 1);

    // The tail is the last element, which is the largest of the current pass.
    const tl = swapped[swapped.length - 1];


    // Recursively sort the head and then append the tail.
    return [...bsort(hd), tl];
};


/**
 * Implements a recursive selection sort algorithm.
 * It finds the minimum element, places it at the beginning,
 * and then recursively sorts the remaining elements.
 * @param {Array<Array<number|string>>} arr - The array to be sorted.
 * @returns {Array<Array<number|string>>} - The sorted array.
 */
const ssort = arr => {

    // Base case: An empty array is already sorted.
    if (arr.length === 0) {
        return [];
    }


    // Find the minimum element in the current array based on its numeric value.
    const min = arr.reduce((acc, x) => acc[0] > x[0] ? x : acc);

    // Get the first element of the current array.
    const hd = arr[0];

    // Create a new array for the recursive call.
    // If an element's original string value matches the minimum's original string value,
    // replace it with the original head element (this is a key part of how selection sort
    // stability is sometimes handled or *not* handled depending on implementation details,
    // but here it's specifically for the stability check).
    const filter = arr.slice(1).map(x => x[1] === min[1] ? hd : x);


    // Place the minimum element at the beginning and recursively sort the rest.
    return [min, ...ssort(filter)];
};


/**
 * Checks if a sort operation is stable.
 * A sort is stable if elements with equal keys maintain their relative order
 * from the original input.
 * @param {Array<Array<number|string>>} bsort - The result of the bubble sort (stable reference).
 * @param {Array<Array<number|string>>} arr - The array sorted by another algorithm (e.g., selection sort).
 * @returns {boolean} - True if the sort is stable, false otherwise.
 */
const isStable = (bsort, arr) => arr.every((x, i) => bsort[i][1] === x[1]);


// Perform bubble sort on the initial data.
const bsorted = bsort(data);

// Perform selection sort on the initial data.
const ssorted = ssort(data);


// Print the result of the bubble sort (original string values).
console.log(bsorted.map(x => x[1]).join(' '));

// Bubble sort is inherently stable.
console.log('Stable');


// Print the result of the selection sort (original string values).
console.log(ssorted.map(x => x[1]).join(' '));

// Check and print the stability of the selection sort compared to bubble sort.
console.log(isStable(bsorted, ssorted) ? 'Stable' : 'Not stable');