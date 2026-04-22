"use strict"; /* This directive enforces strict parsing and error handling in the script. */

// Initialize input processing variables.
var input = require("fs") . readFileSync( "/dev/stdin" , "utf8" );

var cin = input . split( / |\n/ ) ,
    cid = 0; // 'cid' serves as the current index for the 'cin' array.

/**
 * Retrieves the next number from the input array.
 * @returns {number} The next number.
 */
function next ( ) {
    return +cin[ cid++ ];
}

/*
 * Fetches the next string from the input array.
 *
 * @returns {string} The next string.
 */
function nextstr ( )
{
    return cin[ cid++ ];
}

// Function to get the next BigInt from the input.
function nextbig ( ) {
    return BigInt( cin[ cid++ ] ) ;
}

/**
 * Reads 'n' items from the input, optionally converting them to numbers.
 * @param {number} n - The number of items to read.
 * @param {boolean} a - If true, return as strings; otherwise, convert to numbers.
 * @returns {Array} An array of the read items.
 */
function nexts ( n , a ) {
    return a
        ? cin . slice( cid , cid += n )
        : cin . slice( cid , cid += n ) . map( a => +a )
    ;
}

// Reads a 2D matrix (h rows, w columns) from the input.
function nextm ( h , w , a ) {
    var r = [ ] ,
        i = 0;

    // If 'a' is true, elements are kept as strings.
    if ( a )
    {
        for ( ; i < h ; i++ )
        {
            r . push( cin . slice( cid , cid += w ) ) ;
        }
    }
    // Otherwise, elements are converted to numbers.
    else
    {
        for ( ; i < h ; i++ )
        {
            r . push( cin . slice( cid , cid += w ) . map( a => +a ) ) ;
        }
    }
    return r ;
}

/*
 * Dynamically creates a multi-dimensional array with a specified fill value.
 *
 * @param {*} v - The value to fill the innermost array with.
 * @returns {Array} The generated multi-dimensional array.
 */
function xArray ( v ) {
    var a = arguments ,
        l = a . length ,
        r = "Array(a[" + --l + "]).fill().map(x=>{return " + v + ";})" ;

    while ( --l )
    {
        r = "Array(a[" + l + "]).fill().map(x=>" + r + ")" ;
    }

    return eval( r ) ;
}


// Call the main function to get the result.
var myOut = main ( ) ;

// If there's an output, print it to the console.
if ( myOut !== undefined )
{
    console . log( String( myOut ) ) ;
}


/*
 * The main logic of the program.
 *
 * This function processes an array based on certain conditions.
 */
function main ( )
{
    // Read the size of the array.
    var n = next ( ) ;

    // Initialize array 'a' with a leading zero, then concatenate 'n' more elements.
    var a = [ 0 ] . concat( nexts( n ) ) ;

    // Outer loop for 'k' from 0 to n-1.
    for ( var k = 0 ; k < n ; k++ )
    {
        // Inner loop for 'i' from n down to 1.
        for ( var i = n ; i >= 1 ; i-- )
        {
            var sum = 0 ; // Initialize sum for current 'i'.

            // Innermost loop to calculate sum of elements at multiples of 'i'.
            for ( var j = i ; j <= n ; j += i )
            {
                sum += a[ j ] ;
            }

            // If the sum is negative, set all corresponding elements to 0.
            if ( sum < 0 )
            {
                for ( var j = i ; j <= n ; j += i )
                {
                    a[ j ] = 0 ;
                }
            }
        }
    }

    // Calculate and return the sum of all elements in array 'a'.
    return a . reduce( ( a , b ) => a + b ) ;
}