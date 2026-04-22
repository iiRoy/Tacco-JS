/*
 * This JavaScript file processes input from standard input.
 * It contains utility functions and a main logic block.
 * The primary purpose is to check for the presence of a specific character.
 */

// Define a utility function 'int' to parse integers.
// It takes a string 'x' and converts it into a base-10 integer.
var int  =  ( x )  =>  parseInt( x ,  10 ) ;

// Define another utility function 'spln' to split a string by newline characters.
// This is useful for processing multi-line input.
var spln  =  ( x )  =>  x . split( /\n/g ) ;

// Define a third utility function 'spsp' to split a string by whitespace characters.
// This is often used for tokenizing input lines.
var spsp  =  ( x )  =>  x . split( /\s/g ) ;


/**
 * The main function that orchestrates the program's logic.
 * It processes the given input string to determine an outcome.
 *
 * @param { string } input  - The entire content read from the standard input.
 * @returns { void }
 */
function main ( input )
{
    // Check if the input string contains the character '2'.
    // The 'includes' method is case-sensitive for strings.
    if  (  input . includes ( '2' )  )
    {
        // If the character '2' is found anywhere in the input,
        // print 'No' to the console.
        console . log ( 'No' ) ;
    }
    else
    {
        // If the character '2' is NOT found in the input,
        // print 'Yes' to the console.
        console . log ( 'Yes' ) ;
    }
}


// This section is responsible for reading the input and invoking the main function.
// It uses Node.js's 'fs' module to read from '/dev/stdin'.
main (
    require ( 'fs' )
        . readFileSync (
            '/dev/stdin' ,
            'utf8'
        )
) ;

// End of the JavaScript program.
// No further execution beyond this point.