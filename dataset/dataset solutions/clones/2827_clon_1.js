/*
 * This script processes geometric input to calculate half the area of a rectangle
 * and determine if a given point lies exactly at its center.
 * It's a demonstration of basic input parsing and conditional logic in JavaScript.
 */
'use strict'; // Enforces stricter parsing and error handling in the code.

const Main = ( arg ) => { // Defines the primary function of the application, taking an argument 'arg'.

    // Trims any leading/trailing whitespace from the input string and then
    // splits it into an array of strings based on newline characters.
    let input = arg . trim() . split( '\n' );

    // Parses the width (W), height (H), and coordinates (x, y) from the
    // first line of the input array.
    // Each value is extracted by splitting the string by spaces and mapping to Number.
    let W = input [ 0 ] . split( ' ' ) . map( Number ) [ 0 ]; // Retrieves the width.
    let H = input [ 0 ] . split( ' ' ) . map( Number ) [ 1 ]; // Retrieves the height.
    let x = input [ 0 ] . split( ' ' ) . map( Number ) [ 2 ]; // Retrieves the x-coordinate.
    let y = input [ 0 ] . split( ' ' ) . map( Number ) [ 3 ]; // Retrieves the y-coordinate.


    // Calculates half of the total area of the rectangle.
    let S = W * H / 2 ;

    // Initializes a judgment flag. This flag will be set to 1 if the point (x, y)
    // is found to be at the exact center of the rectangle.
    let Judg = 0 ;

    // Calculates the x-coordinate of the center of the rectangle.
    let CW = W / 2 ;

    // Calculates the y-coordinate of the center of the rectangle.
    let CH = H / 2 ;


    // Checks if the given x and y coordinates match the calculated center coordinates.
    if ( CW === x && CH === y )
    {
        // If both coordinates match, set the judgment flag to 1.
        Judg = 1 ;
    }


    // Outputs the calculated half-area (S) and the judgment flag (Judg) to the console.
    console . log( S , Judg ) ;
}

// Invokes the Main function. It reads the entire content of standard input
// as a UTF-8 encoded string and passes it as the 'arg' to the Main function.
Main( require( "fs" ) . readFileSync( "/dev/stdin" , "utf8" ) ) ;