/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, keywords, operators, and expressions are preserved exactly.
 * Only whitespace and comments have been altered extensively.
 */

"use strict"
    ; // Enforce strict mode for better error handling and cleaner code.


/*
 * Function to create an input reader object.
 * It reads from /dev/stdin, parses it, and provides methods
 * to access elements sequentially.
 */
const create = ( ) => {

    // Read all input from standard input, decode as UTF-8,
    // trim leading/trailing whitespace, and split by newline characters.
    const input = require( "fs" ) . readFileSync( "/dev/stdin", "utf8" ) . trim( ) . split( "\n" ) ;

    /*
     * The result object contains the list of input lines,
     * a current index, the maximum number of lines,
     * and utility methods for navigation.
     */
    const res = {
        "list" : input , // Store the array of input lines.
        "index" : 0 ,    // Current position in the input array.
        "max" : input . length , // Total number of lines in the input.

        // Checks if there are more elements to read.
        "hasNext" : function ( ) {
            return this . index < this . max
        } ,

        // Returns the next element from the input array and advances the index.
        // Throws an exception if no more elements are available.
        "next" : function ( ) {
            if ( ! this . hasNext ( ) ) {
                throw "ArrayIndexOutOfBoundsException" ; // Indicate out-of-bounds access.
            } else {
                return this . list [ this . index ++ ] ; // Return current element and increment index.
            }
        }
    } ;

    // Return the constructed reader object.
    return res ;
} ;


// Instantiate the input reader.
const o = create ( ) ;


// Helper function to get the next line as a string.
const next = ( ) => o . next ( ) ;


// Helper function to get the next line as an integer.
const nextInt = ( ) => parseInt ( o . next ( ) ) ;


// Helper function to get the next line as an array of strings, split by space.
const nextStrArray = ( ) => o . next ( ) . split ( " " ) ;


// Helper function to get the next line as an array of integers, split by space.
const nextIntArray = ( ) => o . next ( ) . split ( " " ) . map ( el => parseInt ( el ) ) ;


// Helper function to get the next line as an array of characters.
const nextCharArray = ( ) => o . next ( ) . split ( "" ) ;


// Helper function to check if there are more input lines.
const hasNext = ( ) => o . hasNext ( ) ;


// Custom output function for convenience.
const myout = ( ... x ) => console . log ( ... x ) ;


/*
 * Calculates the factorial of a given number 'x'.
 * Uses BigInt for large numbers.
 */
const fn = ( x ) => {
    let ans = 1n ; // Initialize accumulator with BigInt 1.

    // Loop from 1 to x (inclusive).
    for ( let i = 1n ; i <= x ; i ++ ) {
        ans *= i ; // Multiply current answer by the loop counter.
    }

    return ans ; // Return the calculated factorial.
} ;


/*
 * Main execution function of the program.
 * Reads two integers, calculates a specific expression,
 * and prints the result modulo a large prime.
 */
const Main = ( ) => {
    // Read two integers from the input array.
    const [ n , m ] = nextIntArray ( ) ;

    // Calculate the initial answer: n! * m! * 2.
    // All calculations use BigInt.
    let ans = fn ( n ) * fn ( m ) * 2n ;

    // While the answer is greater than the modulus,
    // perform modulo operation by division.
    // This is not a proper modulo, but a specific reduction
    // as per the original code's logic (repeated division).
    while ( ans > 1000000007n ) {
        ans /= 1000000007n ; // Divide by the large prime BigInt.
    }

    // Print the final answer, converting BigInt back to Number.
    console . log ( Number ( ans ) ) ;
} ;


// Execute the main function to start the program.
Main ( ) ;

// End of file.