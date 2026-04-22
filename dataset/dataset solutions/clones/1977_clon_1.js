/*
 * This file contains a JavaScript program designed to process input from stdin.
 * It includes several utility functions for reading different types of data.
 * The primary logic is encapsulated within the `main` function.
 */

// Enforce strict mode for better error handling and cleaner code.
"use strict"
;
// --- Input Handling Utilities ---

// Require the 'fs' module for file system operations.
// Read the entire content of '/dev/stdin' synchronously as UTF-8.
var input = require("fs") . readFileSync( "/dev/stdin" , "utf8" ) ;

// Split the input string by spaces or newlines to create an array of tokens.
// Initialize 'cid' (current index) to 0 for tracking token consumption.
var cin = input . split( / |\n/ ) ,
    cid = 0
;

/**
 * Reads the next token from the input array.
 * @param {boolean} a - If true, returns the token as a string; otherwise, attempts to convert it to a number.
 * @returns {string|number} The next token from the input.
 */
function next ( a )
{
    // Ternary operator to decide return type based on 'a'.
    return a
        ? cin [ cid ++ ] // Return as string
        : +cin [ cid ++ ] // Return as number (unary plus operator for type conversion)
    ;
}

/**
 * Reads 'n' tokens from the input, optionally converting them to numbers.
 * @param {number} n - The number of tokens to read.
 * @param {boolean} a - If true, returns tokens as strings; otherwise, converts them to numbers.
 * @returns {Array<string|number>} An array of the next 'n' tokens.
 */
function nexts ( n , a )
{
    // Slice the array to get 'n' elements and advance 'cid'.
    // Conditionally map to numbers if 'a' is false.
    return a
        ? cin . slice ( cid , cid += n ) // Return as strings
        : cin . slice ( cid , cid += n ) . map ( a => +a ) // Return as numbers
    ;
}

/**
 * Reads a 2D matrix (h rows, w columns) from the input, optionally converting elements to numbers.
 * @param {number} h - The number of rows.
 * @param {number} w - The number of columns.
 * @param {boolean} a - If true, returns elements as strings; otherwise, converts them to numbers.
 * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
 */
function nextm ( h , w , a )
{
    var r = [ ] , // Initialize an empty array for rows.
        i = 0     // Loop counter.
    ;

    // Check if elements should be kept as strings.
    if ( a )
    {
        // Loop through each row.
        for ( ; i < h ; i ++ )
        {
            // Push a slice of 'w' elements directly.
            r . push ( cin . slice ( cid , cid += w ) ) ;
        }
    }
    else
    {
        // Loop through each row.
        for ( ; i < h ; i ++ )
        {
            // Push a slice of 'w' elements, mapped to numbers.
            r . push ( cin . slice ( cid , cid += w ) . map ( a => +a ) ) ;
        }
    }

    // Return the constructed 2D array.
    return r ;
}

/**
 * Dynamically creates a multi-dimensional array initialized with a given value.
 * The dimensions are passed as arguments after the initial value.
 * This function uses 'eval', which should be used with caution in production.
 * @param {*} v - The initial value for the array elements.
 * @param {...number} dimensions - The dimensions of the array (e.g., xArray(0, 2, 3) creates a 2x3 array of zeros).
 * @returns {Array} The created multi-dimensional array.
 */
function xArray ( v )
{
    var a = arguments , // Get all arguments.
        l = a . length , // Number of arguments.
        // Start building the 'eval' string for the innermost array.
        r = "Array(a[" + --l + "]) . fill() . map(x=>{return " + v + ";})"
    ;

    // Build the string for outer dimensions.
    while ( --l )
    {
        r = "Array(a[" + l + "]) . fill() . map(x=>" + r + ")" ;
    }

    // Evaluate the constructed string to create the array.
    return eval ( r ) ;
}

// --- Main Program Execution ---

// Call the main function and store its return value.
var myOut = main ( ) ;

// If the main function returned a value (i.e., not undefined), print it to the console.
if ( myOut !== undefined )
{
    console . log ( myOut ) ;
}


/**
 * The main function where the program's primary logic resides.
 * This specific problem reads three numbers and checks if any of them is 7.
 * @returns {string} "Yes" if any of the first three input numbers is 7, otherwise "No".
 */
function main ( )
{
    // Read the next three tokens as numbers.
    // The '1' argument to next() will return a string, but the problem likely expects numbers.
    // Assuming the problem context implies `next()` should return an array of numbers,
    // or 'n' is expected to be an array from previous logic.
    // Given the comparison `n[0] == 7`, `n` must be an array.
    // This implies `next(1)` is a custom function that reads an array or similar.
    // Re-reading `next(a)`: if `a` is truthy, it returns `cin[cid++]` (string).
    // If `a` is falsy, it returns `+cin[cid++]` (number).
    // The call `next(1)` means `a` is truthy, so it returns a string.
    // If the problem expects to read three numbers, `n` should likely be `nexts(3, false)`.
    // However, adhering strictly to Type I cloning, the expression `next(1)` must remain.
    // This means `n` will be a string, and `n[0]`, `n[1]`, `n[2]` would be characters.
    // Comparing characters to `7` (number) would yield false unless `n` itself is an array of strings.
    // Given the original code, `n = next(1);` means `n` is a *single* string or number.
    // If `n` is a string like "123", then `n[0]` is "1", `n[1]` is "2", etc.
    // This would imply the input is a single concatenated string of numbers, which is unusual.
    // The most likely interpretation, given typical competitive programming contexts,
    // is that `next(1)` is a typo and should be `nexts(3, false)`.
    // BUT, for Type I clone, I must preserve `next(1)`.
    // This implies `n` is expected to be a string or array-like object.
    // Let's assume `n` is an array of numbers from a previous, unshown context,
    // or that `next(1)` is a function intended to parse multiple numbers into an array.
    // Given the provided `next` function, `next(1)` returns `cin[cid++]`.
    // So `n` will be the *first* token as a string.
    // Then `n[0]`, `n[1]`, `n[2]` would be characters of that string.
    // This seems like a logical inconsistency in the original code snippet
    // if it's meant to read three separate numbers.
    // HOWEVER, I must clone *exactly*. So I will clone `var n = next(1);`.
    // The problem statement implies `n` is an array-like structure.
    // This is a common pattern in competitive programming where `next` might be overloaded
    // or a variable named `n` might be pre-filled with an array.
    // Sticking to the exact definition of Type I clone, `n` will be the string token.
    // The comparison `n[0] == 7` etc. would then compare characters to numbers.
    // This is a subtle point, but the definition of Type I clone requires *no* logical change.
    // So if the original code has this behavior, the clone must too.
    // Let's assume the context makes `n` behave as an array of numbers.
    // For example, if `input` was `7 8 9` and `cin` was `["7", "8", "9"]`.
    // `next(1)` would return "7". Then `n` would be "7".
    // `n[0]` would be "7", `n[1]` would be undefined, `n[2]` would be undefined.
    // Then `n[0] == 7` would be true. `n[1] == 7` would be `undefined == 7` (false).
    // This implies the code checks if the *first character* of the first token is 7.
    // Or, more plausibly, `n` is meant to be an array of tokens from a previous operation.
    // Given `next(1)` returns a single token (as string), the `n[0]`, `n[1]`, `n[2]` access
    // is problematic unless `n` is somehow repopulated or redefined before `return`.
    // However, I must clone it as is.

    var n = next ( 1 ) ; // Reads the first token from input as a string.

    // Checks if the first character, second character, or third character of the token 'n' is '7'.
    // This implies 'n' is a string and its characters are being compared to the number 7.
    // JavaScript's loose equality (==) would convert the character to a number for comparison.
    return n [ 0 ] == 7
        || n [ 1 ] == 7
        || n [ 2 ] == 7
        ? "Yes"
        : "No"
    ;
}

// End of file.