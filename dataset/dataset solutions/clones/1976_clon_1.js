/*
 * This is a Type I clone of a JavaScript program.
 * It strictly adheres to the definition: "Code fragments are exactly equal,
 * except for possible variations in whitespace and comments."
 *
 * All identifiers, variable names, function names, operators, and expressions
 * remain completely unchanged.
 *
 * Extensive changes in whitespace and comments have been applied to
 * make the result visually distinct while maintaining logical and
 * structural identity.
 */


"use strict"
; // Enforce strict mode for better error handling and cleaner code.


// Standard input reading utilities.
// Utilizes Node.js 'fs' module to synchronously read from standard input.
var input = require( "fs" ). readFileSync( "/dev/stdin", "utf8" )
;


// 'cin' stores the input tokens, split by spaces or newlines.
// 'cid' is a pointer to the current token index in 'cin'.
var cin = input. split( / |\n/ )
,   cid = 0
;


/**
 * Reads the next token from the input stream.
 * Depending on the 'a' flag, it returns the token either as a string or a number.
 *
 * @param {boolean} a - If true, returns the token as a string. Otherwise, attempts to convert it to a number.
 * @returns {string|number} The next token from the input.
 */
function next ( a )
{
    // The ternary operator ensures the correct type is returned.
    return a
        ? cin[ cid ++ ] // Return as string
        : + cin[ cid ++ ] // Return as number (unary plus operator)
    ;
}


/**
 * Reads 'n' consecutive tokens from the input stream.
 *
 * @param {number} n - The number of tokens to read.
 * @param {boolean} a - If true, returns an array of string tokens. Otherwise, returns an array of number tokens.
 * @returns {Array<string|number>} An array containing the read tokens.
 */
function nexts ( n, a )
{
    // Slices the 'cin' array from 'cid' up to 'cid + n', then updates 'cid'.
    return a
        ? cin. slice( cid, cid += n ) // Return array of strings
        : cin. slice( cid, cid += n ). map( a => + a ) // Return array of numbers
    ;
}


/**
 * Reads a 2D matrix (h rows, w columns) from the input stream.
 *
 * @param {number} h - The number of rows in the matrix.
 * @param {number} w - The number of columns per row.
 * @param {boolean} a - If true, elements are strings. Otherwise, elements are numbers.
 * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
 */
function nextm ( h, w, a )
{
    var r = [] // Initialize an empty array to store rows of the matrix.
    ,   i = 0  // Loop counter for rows.
    ;

    // Check the 'a' flag to determine element type.
    if ( a )
    {
        // If 'a' is true, push string slices directly.
        for ( ; i < h ; i ++ )
        {
            r. push( cin. slice( cid, cid += w ) )
            ;
        }
    }
    else
    {
        // If 'a' is false, map slices to numbers before pushing.
        for ( ; i < h ; i ++ )
        {
            r. push( cin. slice( cid, cid += w ). map( a => + a ) )
            ;
        }
    }

    return r
    ;
}


/**
 * Dynamically creates a multi-dimensional array with specified dimensions.
 * The innermost elements are initialized based on the provided expression 'v'.
 *
 * @param {*} v - The value or expression to initialize the innermost elements with.
 * @param {...number} dimensions - Variable number of arguments representing the dimensions of the array.
 * @returns {Array} The created multi-dimensional array.
 */
function xArray ( v )
{
    var a = arguments // 'a' holds all arguments passed to xArray.
    ,   l = a. length   // 'l' is the total number of arguments.
    ,   r = "Array(a[" + -- l + "]).fill().map(x=>{return " + v + ";})" // String representation for innermost array.
    ;

    // Build the string representation for outer dimensions.
    while ( -- l )
    {
        r = "Array(a[" + l + "]).fill().map(x=>" + r + ")"
        ;
    }

    // Evaluate the constructed string to create the actual array.
    return eval( r )
    ;
}


// A common modulus value (10^9 + 7) used in competitive programming for large number operations.
var mod = 1e9 + 7
;


// Execute the main program logic.
var myOut = main()
;

// If the main function returns a defined value, print it to the console.
if ( myOut !== undefined )
{
    console. log( myOut )
    ;
}


/**
 * The main function where the core logic of the program resides.
 * This function calculates a maximum sum based on specific sorting and partitioning
 * of an input array of numbers and their original indices.
 *
 * @returns {number} The maximum sum found after evaluating all valid partitions.
 */
function main ()
{
    // Read the number of elements 'n' from the input.
    var n = next()
    ;

    // Initialize an array 'a' to store pairs of [value, original_index].
    var a = []
    ;

    // Populate array 'a' with 'n' elements.
    // Each element is an array containing the next input value and its original index.
    for ( var i = 0 ; i < n ; i ++ )
    {
        a. push( [ next(), i ] )
        ;
    }

    // Initialize 'ans' to store the maximum sum found across all partitions.
    var ans = 0
    ;

    // Iterate through all possible split points 'i' for the array 'a'.
    // 'i' effectively represents the size of the first partition 'b'.
    // The loop starts from 1 because a partition of size 0 or 'n' would be trivial.
    for ( var i = 1 ; i < n ; i ++ )
    {
        // Initialize two temporary arrays 'b' and 'c' for partitioning 'a'.
        var b = [] // First partition
        ,   c = [] // Second partition
        ;

        // Partition the original array 'a' into 'b' and 'c' based on the current split point 'i'.
        // Elements with index less than 'i' go into 'b', others go into 'c'.
        for ( var j = 0 ; j < n ; j ++ )
        {
            if ( j < i )
            {
                b. push( a[ j ] )
                ;
            }
            else
            {
                c. push( a[ j ] )
                ;
            }
        }

        // Sort array 'b' in ascending order based on the first element (the value).
        b. sort( ( a, b ) => a[ 0 ] - b[ 0 ] )
        ;

        // Sort array 'c' in descending order based on the first element (the value).
        c. sort( ( a, b ) => b[ 0 ] - a[ 0 ] )
        ;

        // Initialize 'sum' for the current partition's calculation.
        // 'f' is a flag (1 for valid, 0 for invalid) to indicate if the current partition is viable.
        var sum = 0
        ,   f   = 1
        ;

        // Calculate the contribution to 'sum' from elements in 'c' (the second partition).
        // The loop continues as long as 'f' is 1 (meaning the partition is still considered valid).
        for ( var j = 0 ; j < c. length && f ; j ++ )
        {
            // 't' represents a calculated value based on the original index and current sorted index.
            // It reflects a "displacement" or "cost".
            var t = c[ j ][ 1 ] - j
            ;

            // If 't' is negative, this arrangement is invalid.
            if ( t < 0 )
            {
                f = 0
                ; // Set flag to 0 to invalidate this partition.
            }
            else
            {
                // Add the product of 't' and the element's value to the current sum.
                sum += t * c[ j ][ 0 ]
                ;
            }
        }

        // Calculate the contribution to 'sum' from elements in 'b' (the first partition).
        // This loop also continues only if 'f' is still 1.
        for ( var j = 0 ; j < b. length && f ; j ++ )
        {
            // 't' is calculated considering the length of 'c' partition.
            var t = j + c. length - b[ j ][ 1 ]
            ;

            // If 't' is negative, this arrangement is invalid.
            if ( t < 0 )
            {
                f = 0
                ; // Invalidate the partition.
            }
            else
            {
                // Add the product of 't' and the element's value to the current sum.
                sum += t * b[ j ][ 0 ]
                ;
            }
        }

        // If the current partition arrangement is valid ('f' is 1)
        // and the calculated 'sum' is greater than the 'ans' found so far,
        // update 'ans' with this new maximum sum.
        if ( f && ans < sum )
        {
            ans = sum
            ;
        }
    }

    // Return the final maximum sum found across all valid partitions.
    return ans
    ;
}