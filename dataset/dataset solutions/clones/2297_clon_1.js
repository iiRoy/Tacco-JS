/*
 * This is a Type I clone of the original JavaScript code.
 *
 * All identifiers, variable names, function names, operators, and expressions
 * remain absolutely identical to the source.
 *
 * Only whitespace (indentation, spacing, blank lines) and comments have been altered
 * to make the code appear visually distinct, yet functionally equivalent.
 */
"use strict" /* Enforce strict mode for cleaner code and fewer errors. */

// Define a function named 'create' to set up input reading.
const create = ( ) =>
{

    // Read input from standard input, decode as UTF-8, trim whitespace, and split by newlines.
    const input = require( "fs" ) . readFileSync( "/dev/stdin", "utf8" ) . trim( ) . split( "\n" ) ;

    // Initialize a result object to manage input stream.
    const res =
        {
            "list" : input , // Store the array of input lines.
            "index" : 0 ,    // Current position in the input array.
            "max" : input.length , // Total number of lines in the input.

            // Method to check if there are more elements to read.
            "hasNext" : function ( ) {
                return this.index < this.max
            } ,

            // Method to get the next element from the input.
            "next" : function ( )
            {
                if ( ! this . hasNext ( ) )
                {
                    // Throw an error if attempting to read beyond the array bounds.
                    throw "ArrayIndexOutOfBoundsException" ;
                }
                else
                {
                    // Return the current element and increment the index.
                    return this.list[ this.index++ ] ;
                }
            }
        } ;

    // Return the configured input reader object.
    return res ;
}

// Create an instance of the input reader.
const o = create ( ) ;

// Utility function to get the next string from input.
const next = ( ) => o.next( )

// Utility function to get the next integer from input.
const nextInt = ( ) => parseInt( o.next( ) )

// Utility function to get the next line as an array of strings.
const nextStrArray = ( ) => o.next( ) . split( " " )

// Utility function to get the next line as an array of integers.
const nextIntArray = ( ) => o.next( ) . split( " " ) . map( el => parseInt( el ) )

// Utility function to get the next line as an array of characters.
const nextCharArray = ( ) => o.next( ) . split( "" )

// Utility function to check if there is more input.
const hasNext = ( ) => o.hasNext( )

// Utility function for convenient console output.
const myout = ( ...x ) => console.log( ...x )


// Main program logic encapsulated in the 'Main' function.
const Main = ( ) =>
{
    // Read the input value X.
    const X = nextInt( )

    // Define the maximum limit for prime number checking.
    const max = 1000000

    // Initialize a boolean array 'p' to mark numbers as potentially prime.
    const p = new Array( max ) . fill( true )

    // Sieve of Eratosthenes optimization: Mark all even numbers greater than 2 as not prime.
    for ( let i = 4 ; i < max ; i = i + 2 )
    {
        p[ i ] = false
    }

    // Explicitly mark 1 and 0 as not prime.
    p[ 1 ] = false
    p[ 0 ] = false

    // Apply the Sieve of Eratosthenes algorithm.
    // Start from 3 and iterate only over odd numbers.
    for ( let i = 3 ; i < max ; i = i + 2 )
    {
        // If 'i' is already marked as not prime, skip it.
        if ( p[ i ] == false ) continue

        // If 'i' is prime, mark all its multiples as not prime.
        for ( let j = 2 ; i * j < max ; j ++ )
        {
            p[ j * i ] = false
        }
    }

    // Find the smallest prime number greater than or equal to X.
    for ( let i = X ; i < max ; i ++ )
    {
        // If 'i' is prime, print it and terminate.
        if ( p[ i ] == true )
        {
            console.log( i )
            return // Exit the Main function once the first prime is found.
        }
    }
}

// Execute the main program.
Main( )