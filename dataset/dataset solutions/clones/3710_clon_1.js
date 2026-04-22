// This file calculates the minimum "sadness" value based on a list of integers.
// It uses standard JavaScript features and strict mode for better error handling.

'use strict'; /* Enforce strict mode for cleaner code and fewer errors. */


// Define a helper function to process the input list.
// This function takes an array of strings (intList) and transforms it.
// For each element, it parses it as an integer and subtracts its 1-based index.
// The result is accumulated into a new array.
const processList  =  ( intList )  =>
    intList.reduce(
        ( acc, curr, index )  =>
            [...acc,  parseInt(curr)  -  ( index + 1 )],  // Accumulate transformed value
        [ ] // Initial accumulator is an empty array
    )
; /* End of processList function definition */


// Define another helper function to calculate the total "sadness".
// Sadness is the sum of absolute differences between processed elements
// and a reference value (median + index + 1).
const getSadness  =  ( intList, median )  =>
    intList.reduce(
        ( acc, curr, index )  =>
            acc
            +
            Math.abs(
                parseInt(curr)
                -
                ( median + index + 1 )
            )
        ,
        0 // Initial accumulator for sadness sum
    )
; /* End of getSadness function definition */


// --- Main execution block starts here ---

// Read input from standard input.
// The input is expected to be two lines:
// 1. A count (not explicitly used for array length, but often for context).
// 2. A space-separated list of numbers.
const input  =  require( "fs" )
    .readFileSync( "/dev/stdin",  "utf8" )
    .split( "\n" )
; // Read input file and split by newline


// Parse the count from the first line of input.
const count  =  parseInt( input[0] )
; // Convert the first input line to an integer


// Split the second line of input into an array of strings.
// These strings represent the raw numbers to be processed.
const inputList  =  input[1].split( " " )
; // Get the list of numbers from the second input line


// Process the input list using the defined function
// and then sort the resulting numbers in ascending order.
const processedList  =  processList( inputList )
    .sort(
        ( a, b )  =>  a - b
    )
; // Apply transformation and sort the list


// Calculate the median of the processed and sorted list.
// For an even number of elements, this takes the lower median.
const median  =  processedList[ Math.floor( count / 2 ) ]
; // Find the median element of the processed list


// Calculate the minimum sadness using the original input list and the derived median.
// This is the final calculation based on the problem's logic.
const minSadness  =  getSadness( inputList, median )
; // Compute the total sadness


// Output the final calculated minimum sadness value to the console.
console.log( minSadness )
; // Display the result
// --- End of script ---