/*
 * This file contains a JavaScript program designed to solve a specific
 * geometric problem involving coordinate transformations.
 * It reads initial points and calculates derived points based on a rotation logic.
 */
"use strict" /* This directive enforces strict parsing and error handling,
                helping to write cleaner and more robust code. */

// Definition of the main function, which serves as the entry point for program logic.
function   main   (   input   )   {

    // Process the input string: split by newlines or spaces, then convert each part to an integer.
    // The '~~' operator is used here for a concise integer conversion, effectively truncating decimals.
    const   sq   =   input   .   split   (   /\n|\s/   )   .   map   (   v   =>   ~~v   )   ;

    // Calculate the x-component of the vector between the first two points.
    // This represents the horizontal displacement.
    const   x   =   sq   [   2   ]   -   sq   [   0   ]   ;   // This variable stores the calculated x-distance.

    // Calculate the y-component of the vector between the first two points.
    // This represents the vertical displacement.
    const   y   =   sq   [   3   ]   -   sq   [   1   ]   ;   // This variable stores the calculated y-distance.

    // Based on the calculated x and y components, determine the coordinates
    // of the third vertex of the geometric figure.
    // The transformation is (x_second - y_displacement, y_second + x_displacement).
    const   x3   =   sq   [   2   ]   -   y   ;

    const   y3   =   sq   [   3   ]   +   x   ;

    // Similarly, calculate the coordinates of the fourth vertex.
    // The transformation for this point is (x_first - y_displacement, y_first + x_displacement).
    const   x4   =   sq   [   0   ]   -   y   ;

    const   y4   =   sq   [   1   ]   +   x   ;

    // Output the computed coordinates (x3, y3, x4, y4) to the standard console.
    // These values represent the final result of the geometric calculation.
    console   .   log   (   x3   ,   y3   ,   x4   ,   y4   )   ;

}

// This line invokes the main function, providing it with input read from standard input.
// The 'fs' module is used to read the file content, typically from a piped source.
main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;