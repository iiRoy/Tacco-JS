/*
 * This file contains JavaScript code for a specific problem.
 * It's related to finding the Least Common Multiple (LCM),
 * but the actual implementation seems to be different.
 * Problem Type: A
 */

// NG could stand for "Not Good" or "Next Generation" - its precise meaning is unclear without further context.
// For the purpose of this clone, it's just a comment.


"use strict";

// --- Input Processing Section ---

/**
 * Reads input from standard input, processes it, and prepares it for calculation.
 * The input is expected to be two lines:
 * 1. Settings (N K)
 * 2. A list of numbers
 */
const inputRaw = require("fs")
    .readFileSync( "/dev/stdin", "utf8" )
    .trim()
    .split( "\n" );

// Constants for accessing specific parts of the raw input array.
const INPUT_SETTINGS_INDEX       = 0;  // Index for the line containing N and K
const INPUT_LIST_INDEX           = 1;  // Index for the line containing the list of numbers

// Constants for accessing specific parts of the settings line.
const INPUT_SETTINGS_N_INDEX     = 0;  // Index for N within the settings line
const INPUT_SETTINGS_K_INDEX     = 1;  // Index for K within the settings line

const INPUT_DELIMITER            = " "; // Delimiter used to split numbers/settings on a line.


// Parse the settings line to extract N and K.
const inputSettings = inputRaw[ INPUT_SETTINGS_INDEX ].split( INPUT_DELIMITER );

// N represents the total number of items, typically as a string from input.
const N             = inputSettings[ INPUT_SETTINGS_N_INDEX ];

// K represents a specific group size or parameter, also as a string.
const K             = inputSettings[ INPUT_SETTINGS_K_INDEX ];


// Parse the list of numbers from the second input line.
// Each element is converted to an integer.
const inputList = inputRaw[ INPUT_LIST_INDEX ]
    .split( INPUT_DELIMITER )
    .map( curr => parseInt( curr ) );


// --- Helper Function Definitions ---

/**
 * Finds the minimum item and its original index within a given list of integers.
 * It uses the reduce method for efficient iteration.
 *
 * @param {number[]} intList - The list of integers to search.
 * @returns {{item: number, index: number}} An object containing the minimum item's value and its zero-based index.
 */
const findMinAndIndex = intList =>
    intList.reduce(
        ( acc, curr, index ) =>
            curr < acc.item
                ? { item: curr, index: index } // If current element is smaller, update the accumulator.
                : acc,                         // Otherwise, keep the current accumulator as is.
        {
            item: intList[ 0 ], // Initialize accumulator with the first item's value.
            index: 0,           // Initialize accumulator with the first item's index.
        }
    );


// --- Main Processing Logic ---

/**
 * Processes the input parameters N, K, and the list of numbers
 * to calculate a specific result based on the minimum element's index.
 *
 * @param {string} N_str - The string representation of N (total items).
 * @param {string} K_str - The string representation of K (group size/parameter).
 * @param {number[]} inputList - The list of numbers where the minimum is to be found.
 * @returns {number} The calculated result, which is a sum of two Math.ceil operations.
 */
const process = ( N_str, K_str, inputList ) => {

    // First, convert N and K from string to integer for numerical calculations.
    const N_int = parseInt( N_str );
    const K_int = parseInt( K_str );

    // Find the minimum value and its index in the provided input list.
    const output = findMinAndIndex( inputList );

    // Extract just the index of the minimum value from the output object.
    const index = output.index;

    // Perform the main calculation based on the problem's specific formula.
    // This formula seems to involve dividing ranges based on the minimum element's index and K.
    return Math.ceil( index / ( K_int - 1 ) ) + Math.ceil( index / ( N_int - K_int - 1 ) );
};


// --- Execution ---

// Call the main processing function with the parsed inputs (N, K, inputList)
// and print the final calculated result to the console.
console.log(
    process(
        N,           // Pass N (as string, will be parsed to integer within the process function).
        K,           // Pass K (as string, will be parsed to integer within the process function).
        inputList    // Pass the array of parsed integers.
    )
);