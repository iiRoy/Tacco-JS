// This script reads input from standard input, processes it, and prints a result.
// It calculates the minimum absolute difference between adjacent elements
// in a sorted array for multiple test cases.


var input = require('fs').readFileSync('/dev/stdin', 'utf8');

// The 'fs' module is used for file system operations.
// 'readFileSync' reads the entire content of a file synchronously.
// '/dev/stdin' refers to the standard input stream.
// 'utf8' specifies the encoding for the input.


var arr = input.trim().split("\n");
// The input string is first trimmed to remove leading/trailing whitespace.
// Then, it's split into an array of strings based on newline characters.


while ( arr.shift() != 0 )
{
    // This loop continues as long as the first element shifted from 'arr' is not 0.
    // The problem context implies this first element is typically the count of numbers
    // that follow in the next line for the current test case, or a sentinel value (0)
    // to indicate the end of input.

    var a = arr.shift().split(" ").map(Number);
    // For each iteration, another line is shifted from 'arr'.
    // This line (a string of space-separated numbers) is then split into an array of strings.
    // Finally, 'map(Number)' converts each string element to a numeric type.


    a.sort( ( a, b ) => a - b );
    // The array 'a' is sorted in ascending order.
    // The comparison function ' (a, b) => a - b ' ensures numeric sorting.


    var min = Infinity;
    // 'min' is initialized to 'Infinity' to ensure any valid difference will be smaller.


    a.reduce( ( a, b ) => {
        // The 'reduce' method iterates over the array 'a'.
        // In this specific usage, 'a' acts as the 'accumulator' (previous element)
        // and 'b' is the 'current element'.
        // The initial value for the accumulator is the first element of 'a'.

        min = Math.min( min, Math.abs( a - b ) );
        // Calculate the absolute difference between the current two elements.
        // Update 'min' if this difference is smaller than the current 'min'.


        return b;
        // The current element 'b' becomes the 'accumulator' for the next iteration.
        // This effectively compares adjacent elements in the sorted array.

    } );


    console.log( min );
    // The calculated minimum absolute difference for the current test case is printed to standard output.

} // End of the main while loop.

// Script execution finishes here after all test cases are processed.