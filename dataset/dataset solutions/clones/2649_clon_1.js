"use strict" /* This directive enforces strict mode, helping to catch common coding errors and "unsafe" actions. */


// Importing the 'fs' (file system) module to read input from a file.
const arg_str = require('fs') . readFileSync ( '/dev/stdin' , 'UTF-8' )
; // The raw string content read from standard input.


// Splitting the input string by newline characters to get an array of lines.
const args_lines = arg_str . split ( '\n' ) ;


// The first line of input represents the value of 'n'.
const n = args_lines [ 0 ] ;


// The second line contains space-separated integers for array 'a'.
// It's split by space and each element is parsed into an integer.
const a = args_lines [ 1 ] . split ( ' ' ) . map ( x => parseInt ( x ) ) ;


// The third line contains space-separated integers for array 'b'.
// Similar processing as array 'a'.
const b = args_lines [ 2 ] . split ( ' ' ) . map ( x => parseInt ( x ) ) ;


// Initialize a counter to track the number of operations performed.
let cnt = 0 ;


// Create a mutable copy of array 'b' to perform operations on.
let current_b = b ;


// Enter an infinite loop that continues until a break condition is met.
while ( true )
{
    // Find the index of the maximum element in the current_b array.
    const max_index = current_b . indexOf ( Math . max ( ... current_b ) ) ;

    // Check if the maximum element is at the beginning of the array (index 0).
    if ( max_index == 0 )
    {
        // If it's the first element, update its value based on its neighbors.
        // It subtracts the second element and the last element.
        current_b [ max_index ] = current_b [ max_index ] - current_b [ 1 ] - current_b [ n - 1 ] ;
    }
    // Check if the maximum element is at the end of the array (index n-1).
    else if ( max_index == ( n - 1 ) )
    {
        // If it's the last element, update its value based on its neighbors.
        // It subtracts the second-to-last element and the first element.
        current_b [ max_index ] = current_b [ max_index ] - current_b [ n - 2 ] - current_b [ 0 ] ;
    }
    // If the maximum element is somewhere in the middle of the array.
    else
    {
        // Update its value by subtracting its immediate left and right neighbors.
        current_b [ max_index ] = current_b [ max_index ] - current_b [ max_index - 1 ] - current_b [ max_index + 1 ] ;
    }

    // Increment the operation counter after each modification.
    cnt ++ ;

    // Check if the modified current_b array is identical to array 'a'.
    // JSON.stringify is used for deep comparison of array contents.
    if ( JSON . stringify ( current_b ) == JSON . stringify ( a ) )
    {
        // If they are identical, print the operation count and exit the loop.
        console . log ( cnt ) ;
        break ; // Terminate the infinite loop.
    }

    // Check if any element in the current_b array has become less than 1.
    if ( current_b . find ( x => x < 1 ) )
    {
        // If any element is less than 1, it means a valid transformation is not possible.
        // Print -1 to indicate failure and exit the loop.
        console . log ( -1 ) ;
        break ; // Terminate the infinite loop.
    }

} // End of the while loop.