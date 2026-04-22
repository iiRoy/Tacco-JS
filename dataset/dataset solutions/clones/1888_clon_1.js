"use strict" ;

// This script processes a series of parenthesis strings.
// It determines if it's possible to arrange and concatenate them
// such that the resulting string forms a valid, balanced parenthesis sequence.

// Import the Node.js 'fs' (file system) module.
// Read the entire content of standard input synchronously.
// The content is assumed to be UTF-8 encoded.
var input = require("fs") .readFileSync( "/dev/stdin" , "utf8" ) ;

// Split the input string into an array of tokens.
// Tokens are separated by spaces or newline characters.
// 'cid' (current index) is a pointer for sequential access to these tokens.
var cin = input .split( / |\n/ ) ,
    cid = 0 ; // Initialize token index to 0.


/**
 * Retrieves the next token from the global 'cin' array.
 * @param {boolean} a - If truthy, returns the token as a string.
 *                      Otherwise, attempts to convert the token to a number.
 * @returns {string|number} The next token from the input.
 */
function next ( a )
{
    // Ternary operator: if 'a' is true, return string; else, return number.
    return a
        ? cin[ cid ++ ]
        : + cin[ cid ++ ] ; // Unary plus operator converts string to number.
}


/**
 * Retrieves a block of 'n' consecutive tokens from the 'cin' array.
 * @param {number} n - The number of tokens to retrieve.
 * @param {boolean} a - If truthy, returns tokens as strings.
 *                      Otherwise, maps them to numbers.
 * @returns {Array<string|number>} An array containing the retrieved tokens.
 */
function nexts ( n , a )
{
    // Slice the 'cin' array from 'cid' up to 'cid + n'.
    // Update 'cid' by adding 'n' to it.
    var slicedTokens = cin .slice( cid , cid += n ) ;

    // If 'a' is true, return the tokens as they are (strings).
    // Otherwise, map each token to its numeric representation.
    return a
        ? slicedTokens
        : slicedTokens .map( a => + a ) ;
}


/**
 * Reads a 2D matrix of dimensions h x w from the input stream.
 * @param {number} h - The number of rows for the matrix.
 * @param {number} w - The number of columns for each row.
 * @param {boolean} a - If truthy, matrix elements are kept as strings.
 *                      Otherwise, elements are converted to numbers.
 * @returns {Array<Array<string|number>>} The parsed matrix.
 */
function nextm ( h , w , a )
{
    var r = [] , // Initialize an empty array to store the rows of the matrix.
        i = 0 ;  // Loop counter for rows.

    // Check if elements should be treated as strings or numbers.
    if ( a ) // If 'a' is truthy, push string slices.
    {
        for ( ; i < h ; i ++ ) {
            r .push( cin .slice( cid , cid += w ) ) ; // Add a row of string tokens.
        }
    }
    else // Otherwise, convert elements to numbers.
    {
        for ( ; i < h ; i ++ ) {
            r .push( cin .slice( cid , cid += w ) .map( a => + a ) ) ; // Add a row of numeric tokens.
        }
    }
    return r ; // Return the constructed matrix.
}


/**
 * Dynamically creates a multi-dimensional array.
 * This function uses 'eval', which can be a security risk if input 'v' is untrusted.
 * @param {*} v - The initial value to fill the innermost array.
 * @param {...number} dimensions - The dimensions of the array (e.g., xArray(0, 2, 3) for a 2x3 array of zeros).
 * @returns {Array} The created multi-dimensional array.
 */
function xArray ( v )
{
    var a = arguments , // Access all arguments passed to the function.
        l = a .length , // Get the total number of arguments.
        // Start building the string for the innermost array.
        // '--l' decrements 'l' before use, pointing to the last dimension.
        r = "Array(a[" + --l + "]) .fill() .map(x => { return " + v + ";})" ;

    // Loop backwards through remaining dimensions to build nested array creation calls.
    while ( --l ) {
        r = "Array(a[" + l + "]) .fill() .map(x => " + r + ")" ;
    }

    // Execute the dynamically generated string as JavaScript code.
    return eval( r ) ;
}


// --- Main Program Execution ---

// Call the 'main' function to execute the core logic.
var myOut = main( ) ;

// If the 'main' function returns a value (i.e., not undefined), print it to the console.
if ( myOut !== undefined ) {
    console .log( myOut ) ;
}


/**
 * The main function encapsulates the primary logic for solving the parenthesis balancing problem.
 * It reads 'n' parenthesis strings and determines if they can be concatenated in some order
 * to form a single valid, balanced parenthesis sequence.
 * @returns {string} "Yes" if possible, "No" otherwise.
 */
function main ( )
{
    // Define constant strings for "No" and "Yes" results to prevent typos.
    var NN = "No" ,
        YY = "Yes" ;

    // Read the total number of parenthesis strings to be processed.
    var n = next( ) ;

    // Initialize arrays to categorize parenthesis strings based on their balance properties.
    // 'up': stores strings that start with a deficit and end with a deficit (cannot restore balance on their own).
    // 'ud': stores strings that start with a deficit but end with a surplus (can help restore balance).
    // 'sum': tracks the total final balance across all strings. Should be 0 for a fully balanced sequence.
    // 'rest': tracks the current available balance for processing subsequent strings.
    var up = [] ,
        ud = [] ,
        sum = 0 ,
        rest = 0 ;

    // Loop through each of the 'n' input strings.
    for ( var i = 0 ; i < n ; i ++ )
    {
        // 'mn' (minimum balance) tracks the lowest balance encountered within the current string.
        // 'last' (last balance) tracks the balance at the end of the current string.
        var mn = 0 ,
            last = 0 ;

        // Read the current string, ensuring it's treated as a string type.
        var s = next( 1 ) ;

        // Iterate through each character of the string to calculate its balance profile.
        for ( var j = 0 ; j < s .length ; j ++ )
        {
            if ( s[ j ] === "(" ) { // If an opening parenthesis, increment balance.
                last ++ ;
            }
            else // If a closing parenthesis, decrement balance.
            {
                last -- ;
                // Update 'mn' if the current balance 'last' is lower than the previously recorded minimum.
                if ( last < mn ) {
                    mn = last ;
                }
            }
        }

        // Add the final balance of the current string to the total sum of all string balances.
        sum += last ;

        // Categorize the string based on its minimum balance ('mn') and final balance ('last').
        if ( mn >= 0 ) { // Case 1: The string never goes into a negative balance.
            rest += last ; // Its final balance can be directly added to 'rest'.
        }
        else if ( last <= 0 ) { // Case 2: The string goes into negative balance and ends with a negative or zero balance.
            up .push( [ -mn , last ] ) ; // Store its maximum deficit (positive value) and final balance.
        }
        else { // Case 3: The string goes into negative balance but ends with a positive balance.
            ud .push( [ -mn , last ] ) ; // Store its maximum deficit and final balance.
        }
    }

    // After processing all strings, a fundamental condition for overall balance is that the total sum of balances must be zero.
    if ( sum ) { // If 'sum' is not zero (truthy), it's impossible to balance.
        return NN ;
    }

    // Process strings in 'ud' (those that start with deficit but end with surplus).
    // Sort 'ud' strings by their maximum deficit (the first element of the inner array) in ascending order.
    // This prioritizes strings that are "easier" to balance first.
    ud .sort( ( a , b ) => a[ 0 ] - b[ 0 ] ) ;

    for ( var i = 0 ; i < ud .length ; i ++ )
    {
        // Check if the current 'rest' balance is sufficient to cover the maximum deficit of the current 'ud' string.
        if ( ud[ i ][ 0 ] > rest ) {
            return NN ; // If not, it's impossible to balance.
        }
        rest += ud[ i ][ 1 ] ; // Add the final balance of this string to 'rest'.
    }

    // Process strings in 'up' (those that start and end with a deficit).
    // Sort 'up' strings by their maximum deficit (first element) in descending order.
    // This prioritizes strings that are "harder" to balance first, ensuring we have enough 'rest' for them.
    up .sort( ( a , b ) => b[ 0 ] - a[ 0 ] ) ;

    for ( var i = 0 ; i < up .length ; i ++ )
    {
        // Use array destructuring to extract 'mn' (max deficit) and 'last' (final balance) from the current 'up' element.
        var [ mn , last ] = up[ i ] ;

        // Check if the current 'rest' balance is sufficient to cover the maximum deficit of the current 'up' string.
        if ( mn > rest ) {
            return NN ; // If not, it's impossible to balance.
        }
        rest += last ; // Add the final balance of this string to 'rest'.
    }

    // If all checks pass, it means a valid, balanced parenthesis sequence can be formed.
    return YY ;
}