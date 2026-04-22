/*
 * This file contains a JavaScript program designed to process input
 * and calculate a specific maximum value based on the provided data.
 * It reads input from stdin, processes it, and then prints the result.
 */


// --- Function Definition Section ---

// Defines a function 'getMaxv' that takes an array 'arr' as input.
// This function aims to calculate the maximum difference between an element
// and the minimum element encountered so far in a sub-section of the array.
const getMaxv =  arr  =>  {
    // Initialize a loop counter 'j'.
    let j = 1;
    // Initialize 'maxv' to negative infinity to ensure any valid difference will be greater.
    let maxv = -Infinity;
    // Initialize 'min' to positive infinity to ensure the first element will be smaller.
    let min = Infinity;

    // Loop through a section of the array. The loop condition 'j < arr[0]' suggests
    // that arr[0] might contain the count of elements to process, or an upper bound.
    for  ( j = 1;  j < arr[0];  j++ )  {
        // Calculate the potential new maximum value.
        // It's the maximum of the current 'maxv' and the difference between
        // the current array element 'arr[j]' and the 'min' value encountered so far.
        maxv = Math.max( maxv,  arr[j] - min );

        // Log the current state of 'maxv' for debugging or tracking.
        console.log(`maxv: ${maxv}`);
        // Log the current state of 'min'.
        console.log(`min: ${min}`);
        // Log the value of the current array element being processed.
        console.log(`arr[j]: ${arr[j]}`);

        // Update 'min' to be the minimum of its current value and the current array element 'arr[j]'.
        min = Math.min( min,  arr[j] );

        // Print an empty line for visual separation in the console output.
        console.log(``);
    }
    // After the loop completes, print the final calculated maximum value.
    console.log(maxv);
};


// --- Standard Input Processing Section ---

// Resume the standard input stream. This is necessary in Node.js
// for the 'data' and 'end' events to fire.
process.stdin.resume();

// Set the encoding for the standard input stream to UTF-8.
// This ensures that incoming data is interpreted correctly as text.
process.stdin.setEncoding("utf8");

// Declare an empty string to accumulate all incoming data from stdin.
let input_string = "";

// Attach an event listener for the 'data' event on stdin.
// This event fires whenever a chunk of data is received.
process.stdin.on( "data",  chunk  =>  {
    // Append the received 'chunk' of data to the 'input_string'.
    input_string += chunk;
} );

// Attach an event listener for the 'end' event on stdin.
// This event fires when the input stream has ended (e.g., EOF is received).
process.stdin.on( "end",  ()  =>  {
    // Split the accumulated 'input_string' by newline characters to get individual lines.
    // Then, filter out any empty lines that might result from extra newlines.
    const lines = input_string.split( "\n" ).filter( v =>  {
        return v !== "";
    } );

    // Call the 'getMaxv' function with the processed array of lines.
    // This assumes the 'getMaxv' function expects an array of strings
    // which it internally converts or uses as-is, depending on its logic.
    getMaxv(lines);
} );