"use strict"
; // Enforce strict mode for better code quality and error handling.


/*
 * This script reads input from /dev/stdin, processes it,
 * and then outputs a result to the console.
 * It includes several utility functions for parsing different types of input.
 */
var input = require( "fs" )
  .readFileSync( "/dev/stdin", "utf8" )
; /* Read the entire content of standard input synchronously,
   * decoding it as UTF-8.
   */

var cin = input.split( / |\n/ )
  , cid = 0
; /* Initialize 'cin' (current input) by splitting the raw input
   * string by spaces or newlines.
   * 'cid' (current index) tracks the position in the 'cin' array.
   */


/**
 * Retrieves the next number from the input array.
 * Converts the string to a number using the unary plus operator.
 * @returns {number} The next number from the input.
 */
function next ( ) {

    return +cin[ cid++ ]
    ;
}


/**
 * Retrieves the next string from the input array.
 * @returns {string} The next string from the input.
 */
function nextstr ( ) {

    return cin[ cid++ ]
    ;
}


/**
 * Retrieves the next BigInt from the input array.
 * Converts the string to a BigInt.
 * @returns {BigInt} The next BigInt from the input.
 */
function nextbig ( ) {

    return BigInt( cin[ cid++ ] )
    ;
}


/**
 * Retrieves an array of numbers or strings from the input.
 * @param {number} n - The number of elements to retrieve.
 * @param {boolean} [a] - If true, return strings; otherwise, return numbers.
 * @returns {Array<number|string>} An array of n elements.
 */
function nexts ( n, a ) {

    if ( a ) {
        return cin.slice( cid, cid += n )
        ;
    } else {
        return cin.slice( cid, cid += n ).map( a => +a )
        ;
    }
}


/**
 * Retrieves a 2D array (matrix) of numbers or strings from the input.
 * @param {number} h - The number of rows.
 * @param {number} w - The number of columns.
 * @param {boolean} [a] - If true, return strings; otherwise, return numbers.
 * @returns {Array<Array<number|string>>} A 2D array (matrix).
 */
function nextm ( h, w, a ) {
    var r = [ ]
      , i = 0
    ;

    if ( a ) {
        for ( ; i < h; i++ ) {
            r.push( cin.slice( cid, cid += w ) )
            ;
        }
    } else {
        for ( ; i < h; i++ ) {
            r.push( cin.slice( cid, cid += w ).map( a => +a ) )
            ;
        }
    }

    return r
    ;
}


/**
 * Creates a multi-dimensional array with a specified initial value.
 * Example: xArray(0, 2, 3) creates a 2x3 array filled with 0s.
 * @param {*} v - The initial value for the innermost array elements.
 * @param {...number} dimensions - The dimensions of the array.
 * @returns {Array} The multi-dimensional array.
 */
function xArray ( v ) {
    var a = arguments
      , l = a.length
      , r = "Array(a[" + --l + "]).fill().map(x=>{return " + v + ";})"
    ;

    while ( --l ) {
        r = "Array(a[" + l + "]).fill().map(x=>" + r + ")"
        ;
    }

    // Evaluate the dynamically constructed string to create the array.
    return eval( r )
    ;
}


// Call the main function and store its result.
var myOut = main( )
;

// If the main function returns a value (not undefined), print it to the console.
if ( myOut !== undefined ) {
    console.log( myOut )
    ;
}


/**
 * The main entry point of the program.
 * Reads a number 'n' and performs a calculation.
 * @returns {number} The calculated result.
 */
function main ( ) {

    // Read the first number from the input.
    var n = next( )
    ;

    // Calculate the smallest multiple of 111 that is greater than or equal to n.
    return Math.ceil( n / 111 ) * 111
    ;
}