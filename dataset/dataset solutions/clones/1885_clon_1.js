/*
 * This is a Type I code clone of the original JavaScript program.
 * It strictly adheres to the definition: "Code fragments are exactly equal,
 * except for possible variations in whitespace and comments."
 *
 * All identifiers, variable names, function names, operators, and expressions
 * are preserved without any alteration.
 *
 * Changes are limited to:
 * - Whitespace (indentation, spacing, blank lines)
 * - Comments (addition, modification, or removal)
 *
 * The aim is to make the code visually distinct while maintaining
 * absolute logical and structural equivalence to the original.
 */

// Enable strict mode for better error handling and cleaner code.
"use strict";

// Read the entire standard input synchronously.
var input = require( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ;

// Split the input into an array by spaces or newlines.
// 'cid' (current index) is used to track the position in the 'cin' array.
var cin = input . split ( / | \n / ) , cid = 0 ;

/**
 * Helper function to get the next item from the input array.
 * If 'a' is truthy, returns the raw string; otherwise, converts to a number.
 * @param {boolean} a - If true, return string; if false/undefined, return number.
 * @returns {string|number} The next value from the input.
 */
function next ( a )
{
    // Check if 'a' is provided and truthy.
    if ( a ) {
        return cin [ cid ++ ] ; // Return raw string, then increment cid.
    }
    else
    {
        return + cin [ cid ++ ] ; // Convert to number, then increment cid.
    }
}


/**
 * Helper function to get a slice of the input array.
 * @param {number} n - The number of elements to retrieve.
 * @param {boolean} a - If true, return raw strings; if false/undefined, convert to numbers.
 * @returns {Array<string|number>} An array of the next 'n' values.
 */
function nexts ( n , a )
{
    // If 'a' is truthy, return a slice of raw strings.
    if ( a ) {
        return cin . slice ( cid , cid += n ) ;
    }
    // Otherwise, return a slice and map to numbers.
    else
    {
        return cin . slice ( cid , cid += n ) . map ( a => + a ) ;
    }
}


/**
 * Helper function to read a 2D matrix from the input.
 * @param {number} h - The number of rows.
 * @param {number} w - The number of columns per row.
 * @param {boolean} a - If true, return raw strings; if false/undefined, convert to numbers.
 * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
 */
function nextm ( h , w , a )
{
    var r = [ ] , i = 0 ; // Initialize result array and loop counter.

    // If 'a' is truthy, push raw string slices.
    if ( a )
    {
        for ( ; i < h ; i ++ )
        {
            r . push ( cin . slice ( cid , cid += w ) ) ;
        }
    }
    // Otherwise, push slices mapped to numbers.
    else
    {
        for ( ; i < h ; i ++ )
        {
            r . push ( cin . slice ( cid , cid += w ) . map ( a => + a ) ) ;
        }
    }

    return r ; // Return the constructed matrix.
}


/**
 * Dynamically creates a multi-dimensional array with a default value.
 * This function uses 'eval' and is generally considered unsafe for untrusted input.
 * @param {*} v - The default value to fill the innermost array.
 * @returns {Array} A multi-dimensional array.
 */
function xArray ( v )
{
    var a = arguments , // Get all arguments passed to xArray.
        l = a . length , // Get the number of arguments.
        // Construct the innermost array creation string.
        r = "Array(a[" + --l + "]).fill().map(x=>{return " + v + ";})" ;

    // Loop backwards from the second to last argument to build nested Array calls.
    while ( --l )
    {
        r = "Array(a[" + l + "]).fill().map(x=>" + r + ")" ;
    }

    return eval ( r ) ; // Evaluate the constructed string to create the array.
}


// Call the main function to execute the primary logic of the program.
var myOut = main ( ) ;

// If the main function returns a defined value, print it to the console.
if ( myOut !== undefined )
{
    console . log ( myOut ) ;
}


/**
 * The main function containing the core logic to solve the problem.
 * It determines if a sequence of parentheses can be balanced.
 * @returns {string} "Yes" or "No" based on the balancing outcome.
 */
function main ( )
{
    // Define constants for output strings.
    var NN = "No" , YY = "Yes" ;

    // Read the number of input strings.
    var n = next ( ) ;

    // Initialize arrays and counters for processing.
    var up = [ ] , // Stores information for strings that end with a positive balance.
        sum = 0 , // Total balance of all strings.
        rest = 0 ; // Current balance available for matching.

    // Loop through each of the 'n' input strings.
    for ( var i = 0 ; i < n ; i ++ )
    {
        var mn = 0 , // Minimum balance encountered during string traversal.
            last = 0 ; // Final balance of the current string.

        // Read the current string.
        var s = next ( 1 ) ;

        // Iterate through each character of the string to calculate balance.
        for ( var j = 0 ; j < s . length ; j ++ )
        {
            // If an opening parenthesis, increment balance.
            if ( s [ j ] === "(" )
            {
                last ++ ;
            }
            // If a closing parenthesis, decrement balance.
            else
            {
                last -- ;
                // Update minimum balance if current balance is lower.
                if ( last < mn )
                {
                    mn = last ;
                }
            }
        }

        // Add the final balance of this string to the overall sum.
        sum += last ;

        // If the string ends with a positive balance, add it to 'rest'.
        if ( last > 0 )
        {
            rest += last ;
        }
        // If the string ends with a non-positive balance,
        // store its minimum balance (negated) and final balance.
        else
        {
            up . push ( [ - mn , last ] ) ;
        }
    }

    // If the total sum of all balances is not zero, it's impossible to balance.
    if ( sum )
    {
        return NN ;
    }

    // Sort the 'up' array (strings ending with non-positive balance)
    // in descending order based on the negated minimum balance.
    // This prioritizes strings that require more 'open' parentheses to be matched.
    up . sort ( ( a , b ) => b [ 0 ] - a [ 0 ] ) ;

    // Process the sorted 'up' strings.
    for ( var i = 0 ; i < up . length ; i ++ )
    {
        // Destructure the stored minimum and final balance for the current string.
        var [ mn , last ] = up [ i ] ;

        // If the required minimum balance ('mn') is greater than the
        // currently available 'rest' balance, it's impossible to balance.
        if ( mn > rest )
        {
            return NN ;
        }

        // Deduct the final balance of this string from 'rest'.
        // Since 'last' is non-positive here, this effectively adds its absolute value to 'rest'.
        rest -= last ;
    }

    // If all checks pass, it's possible to balance the parentheses.
    return YY ;
}