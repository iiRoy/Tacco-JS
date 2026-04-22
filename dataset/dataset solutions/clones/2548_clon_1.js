"use strict" /* Ensure strict mode is enabled throughout the script. */

// Read the entire input string from standard input, using UTF-8 encoding.
const arg_str = require('fs') . readFileSync ( '/dev/stdin' ,  'UTF-8' )

// Split the input string into an array of lines.
const arg = arg_str . split ( '\n' )

// Split the first line of input (arg[0]) by spaces to get initial parameters.
const arg_1 = arg [ 0 ] . split ( ' ' )

// Split the second line of input (arg[1]) by spaces to get the P_array elements.
const P_array = arg [ 1 ] . split ( ' ' )

// Parse the first element of arg_1 as an integer for N.
const N = parseInt ( arg_1 [ 0 ] )

// Parse the second element of arg_1 as an integer for K.
const K = parseInt ( arg_1 [ 1 ] )

// Initialize an empty array to store unique results.
let result = [ ]

// Initialize a counter variable.
let count = 0

/* Create a new array 'p' with a length derived from P_array and K.
   Fill it with zeros initially. This array serves as an iterator for the map function. */
const p = new Array ( P_array . length - K + 1 ) . fill ( 0 )

// Iterate over the 'p' array using the map function.
p . map ( function ( num , index ) { // 'num' is the element (always 0), 'index' is the current index.
    // Check if the current window (index + K) extends beyond the P_array length.
    if ( index + K > P_array . length )
        return // If it does, skip this iteration.

    // Extract the portion of P_array before the current window.
    const a_1 = P_array . slice ( 0 , index )

    // Extract the current window, then sort it in ascending order (lexicographically, since elements are strings).
    const a_2 = P_array . slice ( index , index + K ) . sort ( ( a , b ) => a > b )

    // Extract the portion of P_array after the current window.
    const a_3 = P_array . slice ( index + K )

    // Concatenate the three parts to form a new permutation P.
    const P = a_1 . concat ( a_2 ) . concat ( a_3 )

    // Join the elements of P into a single string for easy comparison.
    const P_str = P . join ( '' )

    // Check if this specific permutation string P_str is already in the 'result' array.
    if ( result . indexOf ( P_str ) < 0 )
    {
        // If it's not found, add it to the 'result' array.
        result . push ( P_str )
    }
    // Increment the counter for every permutation processed.
    count ++
} ) ;

// Finally, log the number of unique permutations found (the length of the 'result' array).
console . log ( Object . keys ( result ) . length )