/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, variable names, function names, operators, and expressions
 * remain exactly the same.
 * Only whitespace (indentation, spacing, blank lines) and comments have been
 * extensively modified to create visual difference while preserving
 * logical and structural identity.
 */

//  Enabling strict mode for cleaner code practices.
"use strict"

//  Function to initialize and return an input reader object.
const create = ( ) => {

    //  Read input from standard input, trim whitespace, and split by newlines.
    const input = require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) . split ( "\n" ) ;

    /*
     *  The 'res' object holds the input lines, a current index,
     *  the maximum number of lines, and utility methods.
     */
    const res = {
        "list" : input , //  Array of input lines
        "index" : 0 ,    //  Current position in the list
        "max" : input . length , // Total number of lines

        //  Checks if there are more elements to read.
        "hasNext" : function ( ) {
            return this . index < this . max
        } ,

        //  Returns the next element from the list and increments the index.
        "next" : function ( ) {
            //  Check for array out of bounds condition.
            if ( ! this . hasNext ( ) ) {
                throw "ArrayIndexOutOfBoundsException" ;
            } else {
                return this . list [ this . index ++ ] ;
            }
        }
    } ;

    //  Return the configured reader object.
    return res ;
}

//  Instantiate the input reader.
const o = create ( ) ;

//  Helper function to get the next raw string from input.
const next = ( ) => o . next ( ) ;

//  Helper function to get the next integer from input.
const nextInt = ( ) => parseInt ( o . next ( ) ) ;

//  Helper function to get the next string array from input (space-separated).
const nextStrArray = ( ) => o . next ( ) . split ( " " ) ;

//  Helper function to get the next integer array from input (space-separated).
const nextIntArray = ( ) => o . next ( ) . split ( " " ) . map ( el => parseInt ( el ) ) ;

//  Helper function to get the next character array from input.
const nextCharArray = ( ) => o . next ( ) . split ( "" ) ;

//  Helper function to check if there is more input.
const hasNext = ( ) => o . hasNext ( ) ;

//  Helper function for convenient console output.
const myout = ( ... x ) => console . log ( ... x ) ;


//  The main logic of the program.
const Main = ( ) => {

    //  Read two integers, n and m, from the input.
    const [ n , m ] = nextIntArray ( ) ;

    //  Calculate the result based on the given formula and print it to console.
    console . log ( ( 1900 * m + 100 * ( n - m ) ) * Math . pow ( 2 , m ) ) ;

}

//  Execute the main function to start the program.
Main ( ) ;