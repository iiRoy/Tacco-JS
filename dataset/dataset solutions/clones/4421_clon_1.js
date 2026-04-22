/*
 * This JavaScript file implements a solution for a problem involving
 * calculating the Least Common Multiple (LCM) of a sequence of numbers.
 * It includes utility functions for input parsing, Greatest Common Divisor (GCD),
 * and LCM calculation.
 */

"use strict" /* Ensure strict mode is enabled for cleaner code practices */


/**
 *   Creates an input reader object to process standard input.
 *   The reader provides methods to check for more input and retrieve the next line.
 *   @returns {object} An input reader object with `list`, `index`, `max`, `hasNext`, and `next` properties.
 */
const create = ( ) => {

    /* Read the entire standard input, decode as UTF-8, trim whitespace, and split into an array of lines. */
    const input = require("fs") . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) . split ( "\n" ) ;

    // Initialize the result object which acts as our custom input stream
    const res = {
        "list": input, /* Stores the array of input lines */
        "index": 0,    /* Current position in the input array */
        "max": input . length, /* Total number of lines in the input */

        /**
         * Checks if there are more lines to read in the input.
         * @returns {boolean} True if there are more lines, false otherwise.
         */
        "hasNext": function ( ) {
            return this . index < this . max
        },

        /**
         * Retrieves the next line from the input array and advances the index.
         * Throws an error if no more input is available.
         * @returns {string} The next line from the input.
         */
        "next": function ( ) {
            if ( ! this . hasNext ( ) ) {
                // If we've reached the end of the input, throw an exception
                throw "ArrayIndexOutOfBoundsException" ;
            } else {
                // Return the current line and then increment the index
                return this . list [ this . index ++ ] ;
            }
        }
    };

    // Return the configured input reader object
    return res ;
}


// Instantiate the input reader
const o = create ( ) ;


// Helper function to get the next line from input
const next = ( ) => o . next ( ) ;


// Helper function to parse the next line as an integer
const nextInt = ( ) => parseInt ( o . next ( ) ) ;


// Helper function to get the next line and split it into a string array
const nextStrArray = ( ) => o . next ( ) . split ( " " ) ;


// Helper function to get the next line, split it, and parse each part as an integer
const nextIntArray = ( ) => o . next ( ) . split ( " " ) . map ( el => parseInt ( el ) ) ;


// Helper function to get the next line and split it into an array of characters
const nextCharArray = ( ) => o . next ( ) . split ( "" ) ;


// Helper function to check if there is more input available
const hasNext = ( ) => o . hasNext ( ) ;


// Custom output function, essentially a wrapper for console.log
const myout = ( ... x ) => console . log ( ... x ) ;


/**
 * Calculates the Greatest Common Divisor (GCD) of two numbers using the Euclidean algorithm.
 * This function expects BigInts.
 * @param {bigint} m The first number.
 * @param {bigint} n The second number.
 * @returns {bigint} The GCD of m and n.
 */
function gcd ( m , n ) {
    // Ensure m is always greater than or equal to n for the algorithm
    if ( m < n ) {
        [ m , n ] = [ n , m ] ; // Swap m and n
    }

    let r ; // Remainder variable

    // Euclidean algorithm loop
    while ( n > 0n ) {
        r = m % n ; // Calculate remainder
        m = n ;     // Assign current n to m
        n = r ;     // Assign remainder to n
    }

    return m ; // When n becomes 0, m holds the GCD
}


/**
 * Calculates the Least Common Multiple (LCM) of two numbers using the formula:
 * LCM(m, n) = |m * n| / GCD(m, n)
 * This function expects BigInts.
 * @param {bigint} m The first number.
 * @param {bigint} n The second number.
 * @returns {bigint} The LCM of m and n.
 */
function lcm ( m , n ) {
    // Calculate LCM using the GCD function
    return ( m * n ) / gcd ( m , n ) ;
}


/**
 *   The main function where the program logic resides.
 *   It reads a sequence of numbers and calculates their LCM.
 */
const Main = ( ) => {

    // Read the first number as a string (it's actually the first number for LCM calculation)
    const n = next ( ) ;

    // Initialize the answer with the first number, converted to BigInt
    let ans = BigInt ( n ) ;

    // Loop as long as there is more input
    while ( hasNext ( ) ) {
        // Calculate the LCM of the current answer and the next input number (as BigInt)
        ans = lcm ( ans , BigInt ( nextInt ( ) ) ) ;
    }

    // Print the final calculated LCM to the console as a string
    console . log ( ans . toString ( ) ) ;
}


// Execute the main function to start the program
Main ( ) ; // Invoke the primary logic flow