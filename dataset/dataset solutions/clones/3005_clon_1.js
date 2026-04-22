// This file contains a JavaScript program for competitive programming.
// It includes a custom Inputer class for parsing input from standard input.

"use strict"; // Enforce strict mode for better code quality and fewer common errors.


/**
 * The main entry point function for the program.
 * It processes the given input string to solve a specific problem.
 *
 * @param {string} input - The raw input string read from stdin.
 */
function Main ( input )
{
    // Initialize an instance of the custom Inputer class to parse input tokens.
    let cin = new Inputer( input ) ;

    // Read the integer N, then an array V of N integers, and another array C of N integers.
    // The Inputer class handles tokenizing and type conversion.
    let N = cin.getInt( ) , V = cin.getIntArray( N ) , C = cin.getIntArray( N ) ;

    // Declare and initialize an array to store the differences V[n] - C[n].
    let VC = new Array( N ) ;

    // Loop through each element from 0 to N-1 to calculate the difference.
    for ( let n = 0 ; n < N ; n ++ )
    {
        // Store the result of V[n] minus C[n] in the VC array at the corresponding index.
        VC[ n ] = V[ n ] - C[ n ] ;
    }

    // Calculate the sum of all positive differences in the VC array.
    // The `reduce` method iterates through VC, adding `v` to `ac` only if `v` is greater than 0.
    // The initial accumulator value is 0.
    let ans = VC.reduce( ( ac , v ) => ac + ( v > 0 ? v : 0 ) , 0 ) ;

    // Print the final calculated answer to the standard output.
    console.log( ans ) ;
}


/**
 * A utility class designed to simplify reading various types of data
 * from a single input string, typically from standard input.
 */
class Inputer
{
    /**
     * The constructor for the Inputer class.
     * It takes the raw input string and prepares it for parsing.
     *
     * @param {string} t - The complete input string, usually from `readFileSync`.
     */
    constructor ( t )
    {
        // Validate that the input string 't' is not undefined.
        if ( typeof t == 'undefined' )
        {
            throw new Error( '引数（stdin）を省略できません！' ) ;
        }

        // Initialize a counter to keep track of the current token being read.
        this.cnt = 0 ;

        // Split the input string into an array of tokens using newlines or spaces as delimiters.
        this.items = t.split( /\n|\s/ ) ;
    }

    /**
     * Reads the next token from the input stream and converts it to an integer.
     *
     * @returns {number} The next integer value.
     */
    getInt ( )
    {
        // Retrieve the current token, increment the counter, and convert it to a number.
        return this.items[ this.cnt ++ ] - 0 ;
    }

    /**
     * Reads a specified number of tokens from the input stream and converts them into an array of integers.
     *
     * @param {number} t - The number of integers to read into the array.
     * @returns {number[]} An array containing the specified number of integers.
     */
    getIntArray ( t )
    {
        // Validate that the length argument 't' is provided.
        if ( typeof t == 'undefined' )
        {
            throw new Error( '引数（1以上）を省略できません！' ) ;
        }

        // Create a new array with the specified length 't'.
        let r = new Array( t ) ;

        // Loop to populate the array by calling `getInt()` for each element.
        for ( let e = 0 ; e < t ; e ++ )
        {
            r[ e ] = this.getInt( ) ;
        }
        return r ;
    }

    /**
     * Reads the next token from the input stream as a string.
     *
     * @returns {string} The next string token.
     */
    getStr ( )
    {
        // Retrieve the current token and increment the counter.
        return this.items[ this.cnt ++ ] ;
    }

    /**
     * Reads a specified number of tokens from the input stream as strings and returns them in an array.
     *
     * @param {number} t - The number of strings to read into the array.
     * @returns {string[]} An array containing the specified number of strings.
     */
    getStrArray ( t )
    {
        // Validate that the length argument 't' is provided.
        if ( typeof t == 'undefined' )
        {
            throw new Error( '引数（1以上）を省略できません！' ) ;
        }

        // Create a new array with the specified length 't'.
        let r = new Array( t ) ;

        // Loop to populate the array by calling `getStr()` for each element.
        for ( let e = 0 ; e < t ; e ++ )
        {
            r[ e ] = this.getStr( ) ;
        }
        return r ;
    }
}


// This conditional block determines how the program receives input based on the execution environment.
// If 'window' is undefined (typical in Node.js environment), it reads from '/dev/stdin'.
if ( typeof window == "undefined" )
{
    // Read the entire content of '/dev/stdin' as a UTF-8 string using Node.js's 'fs' module.
    // Then, pass this string to the Main function for processing.
    Main( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ) ) ;
}