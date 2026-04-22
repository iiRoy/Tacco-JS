/*
 * This is a Type I clone of an original JavaScript program.
 * It strictly adheres to the definition: only whitespace and comments
 * have been altered. All identifiers, expressions, and logic remain
 * completely identical to the source.
 */

"use strict" ; // Enable strict mode for better error handling and cleaner code.


// Read all input from standard input synchronously.
var input = require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ) ;

// Initialize input array 'cin' by splitting the raw input string.
// 'cid' is a pointer to the current index in 'cin'.
var cin = input.split( / |\n/ ) , cid = 0 ;


/**
 * Retrieves the next value from the input array.
 * @param {boolean} a - If true, returns the value as a string; otherwise, converts to a number.
 * @returns {string|number} The next value from the input.
 */
function next( a )
{
    // Ternary operator to decide between string or number conversion.
    return a ? cin[ cid++ ] : +cin[ cid++ ] ;
}


/**
 * Retrieves an array of 'n' values from the input.
 * @param {number} n - The number of values to retrieve.
 * @param {boolean} a - If true, returns values as strings; otherwise, converts to numbers.
 * @returns {Array<string|number>} An array containing the next 'n' values.
 */
function nexts( n , a )
{
    // Slice the array and advance the pointer.
    // Map to number if 'a' is false.
    return a ? cin.slice( cid , cid += n ) : cin.slice( cid , cid += n ).map( a => +a ) ;
}


/**
 * Retrieves a 2D array (matrix) of 'h' rows and 'w' columns from the input.
 * @param {number} h - The number of rows.
 * @param {number} w - The number of columns per row.
 * @param {boolean} a - If true, returns values as strings; otherwise, converts to numbers.
 * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
 */
function nextm( h , w , a )
{
    var r = [ ] , i = 0 ; // Initialize result array and loop counter.

    // Check if values should be kept as strings.
    if ( a )
    {
        // Loop 'h' times for each row.
        for ( ; i < h ; i++ )
        {
            // Push a slice of 'w' elements directly.
            r.push( cin.slice( cid , cid += w ) ) ;
        }
    }
    // Otherwise, convert values to numbers.
    else
    {
        // Loop 'h' times for each row.
        for ( ; i < h ; i++ )
        {
            // Push a slice of 'w' elements, mapped to numbers.
            r.push( cin.slice( cid , cid += w ).map( a => +a ) ) ;
        }
    }

    return r ; // Return the constructed matrix.
}


/**
 * Creates a multi-dimensional array with a specified initial value.
 * This function uses 'eval' for dynamic array creation.
 * @param {*} v - The initial value for the innermost elements.
 * @returns {Array} A multi-dimensional array.
 */
function xArray( v )
{
    var a = arguments , // Get all arguments passed to the function.
        l = a.length , // Get the total number of arguments.
        r = "Array(a[" + --l + "]).fill().map(x=>{return " + v + ";})" ; // Build innermost array creation string.

    // Loop backwards through dimensions to build the nested array creation string.
    while ( --l )
    {
        r = "Array(a[" + l + "]).fill().map(x=>" + r + ")" ;
    }

    return eval( r ) ; // Evaluate the dynamically constructed string to create the array.
}


// Call the main function and store its result.
var myOut = main( ) ;

// If the main function returned a defined value, print it to the console.
if ( myOut !== undefined )
{
    console.log( myOut ) ;
}


/**
 * The main program logic.
 * Reads two numbers 'n' and 'm' and calculates a specific sum.
 * @returns {number} The calculated result.
 */
function main( )
{
    // Read the first two numbers from input.
    var n = next( ) , m = next( ) ;

    // Calculate the sum of combinations: nC2 + mC2.
    // nC2 = n * (n - 1) / 2
    // mC2 = m * (m - 1) / 2
    return n * ( n - 1 ) / 2 + m * ( m - 1 ) / 2 ;
}