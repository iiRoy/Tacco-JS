/* This file enforces strict parsing and execution rules. */
"use strict"
/* -------------------------------------------------------------------------------------- */


// Read the entire input string from standard input, using UTF-8 encoding.
const arg_str   = require('fs')  .  readFileSync  (  '/dev/stdin'  ,  'UTF-8'  )


// Split the input string into an array of lines based on the newline character.
const args_lines=arg_str.split('\n')


// Extract the first line as the value for 'n'.
const n =args_lines[0]


// Extract the second line, split by space, and parse each part as an integer for array 'a'.
const a = args_lines[1].split(' ').map(x=>parseInt(x))


// Extract the third line, split by space, and parse each part as an integer for array 'b'.
const b = args_lines[2].split(' ').map(x=>parseInt(x))

/* -------------------------------------------------------------------------------------- */

// Initialize a counter for the number of operations performed.
let cnt = 0

// Create a mutable copy of array 'b' to perform operations on.
let current_b = b


// Begin an infinite loop that continues until a specific condition is met.
while (true)
{

    // Find the index of the maximum element in the current_b array.
    const max_index=current_b.indexOf(Math.max(...current_b))


    // Check if the maximum element is at the beginning of the array.
    if( max_index == 0 )
    {
        // Apply a specific transformation if max element is at index 0.
        current_b[ max_index ] = current_b[ max_index ] - current_b[ 1 ] - current_b[ n - 1 ]
    }
    // Check if the maximum element is at the end of the array.
    else if  (  max_index == ( n - 1 )  )
    {
        // Apply a specific transformation if max element is at the last index.
        current_b[ max_index ] = current_b[ max_index ] - current_b[ n - 2 ] - current_b[ 0 ]
    }
    // If the maximum element is neither at the beginning nor at the end.
    else
    {
        // Apply a general transformation for max element in the middle.
        current_b[max_index] = current_b[max_index] - current_b[max_index - 1] - current_b[max_index + 1]
    }


    // Increment the operation counter after each transformation.
    cnt ++


    // Check if the transformed array 'current_b' is identical to array 'a'.
    if( JSON.stringify(current_b) == JSON.stringify(a) )
    {
        // If they are identical, break out of the loop.
        break
    }

}

/* -------------------------------------------------------------------------------------- */

// Output the final count of operations to the console.
console.log(cnt)
// End of script.