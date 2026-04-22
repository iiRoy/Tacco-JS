/*
 * This is a JavaScript file.
 * It strictly enforces modern coding standards.
 */
"use strict"

// Define a function to create an input stream reader object.
const create = ( ) => {

    // Read input from standard input, decode as UTF-8, trim whitespace, and split by newlines.
    const input = require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) . split ( "\n" ) ;

    /*
     * The `res` object will encapsulate the input list and provide methods
     * for navigating through it.
     */
    const res = {
        "list": input ,
        "index": 0 ,
        "max": input . length ,
        // Checks if there are more elements to read.
        "hasNext": function ( ) { return this . index < this . max } ,

        // Returns the next element from the list. Throws an error if out of bounds.
        "next": function ( ) {
            if ( ! this . hasNext ( ) ) {
                throw "ArrayIndexOutOfBoundsException" ;
            } else {
                return this . list [ this . index ++ ] ;
            }
        }
    } ; // End of res object definition.

    // Return the created input stream reader.
    return res ;
}

// Create an instance of the input stream reader.
const o = create ( ) ;

// Helper function to get the next raw string from input.
const next = ( ) => o . next ( )

// Helper function to get the next integer from input.
const nextInt = ( ) => parseInt ( o . next ( ) )

// Helper function to get the next string array (space-separated) from input.
const nextStrArray = ( ) => o . next ( ) . split ( " " )

// Helper function to get the next integer array (space-separated) from input.
const nextIntArray = ( ) => o . next ( ) . split ( " " ) . map ( el => parseInt ( el ) )

// Helper function to get the next character array (individual characters) from input.
const nextCharArray = ( ) => o . next ( ) . split ( "" )

// Helper function to check if there's more input.
const hasNext = ( ) => o . hasNext ( )

// Custom output function, essentially a wrapper for console.log.
const myout = ( ... x ) => console . log ( ... x )

/*
 * The main function where the program's logic resides.
 * It calculates an answer based on two integer inputs.
 */
const Main = ( ) => {

    // Destructure two integers from the input array.
    const [ x , y ] = nextIntArray ( )

    // Calculate the initial absolute difference between absolute values.
    let ans = Math . abs ( Math . abs ( x ) - Math . abs ( y ) )

    // Conditional logic to adjust the answer based on x and y values.
    if ( x * y < 0 ) {
        // If x and y have opposite signs.
        ans += 1
    } else if ( ( x > 0 && y == 0 ) || x == 0 && y < 0 ) {
        // Specific cases involving zero and negative/positive values.
        ans += 1
    } else if ( x > y ) {
        // If x is strictly greater than y.
        ans += 2
    }

    // Output the final calculated answer.
    console . log ( ans )
}

// Execute the main function to start the program.
Main ( ) // Program entry point.