/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, variable names, function names, operators, and expressions
 * remain exactly the same as in the original source.
 *
 * The only modifications made are to whitespace (indentation, spacing, blank lines)
 * and comments (addition, removal, or modification).
 *
 * This version should be functionally identical to the original.
 */

'use strict' // Enforce strict mode for better code quality.

// Global variable to store the 2D rectangle grid.
let rect = []; // Initialize rect as an empty array.

/**
 * Main function to process input and perform calculations.
 * @param {string} input - The input string containing dimensions and operations.
 */
function Main ( input ) {
    // Parse the input string into a 2D array of strings.
    // Each line is split by newline, then each line is split by space.
    const d = input . split ( '\n' ) . map ( v => v . split ( ' ' ) ) ;

    // Shift the first element from 'd' to get the dimensions (W, H, N).
    let s = d . shift ( ) ;

    // Convert the string dimensions to numbers.
    const W = Number ( s [ 0 ] ) ; // Width of the rectangle.
    const H = Number ( s [ 1 ] ) ; // Height of the rectangle.
    const N = Number ( s [ 2 ] ) ; // Number of operations.

    /*
     * Initialize the 'rect' array.
     * It will be a 2D array (H rows, W columns) filled with zeros.
     * This represents the canvas where regions will be "colored".
     */
    rect = [ ] ; // Reset rect before initialization, just in case.

    // Loop through rows to create the 2D array.
    for ( let i = 0 ; i < H ; i ++ ) {
        // Inner loop is redundant for initialization, but kept for Type I clone.
        // The Array(W).fill(0) correctly initializes the row.
        for ( let j = 0 ; j < W ; j ++ ) {
            rect [ i ] = Array ( W ) . fill ( 0 ) ; // Create a row of W zeros.
        }
    }

    // Process each operation based on the input 'd'.
    // There are 'N' operations to perform.
    for ( let i = 0 ; i < N ; i ++ ) {
        // The third element of each operation specifies the type of drawing.
        switch ( Number ( d [ i ] [ 2 ] ) ) {
            case 1 : // Case 1: Paint region from x=0 to x=d[i][0] (exclusive).
                // This colors the left part of the rectangle.
                draw ( 0 , d [ i ] [ 0 ] , 0 , H ) ;
                break ; // Exit switch after drawing.

            case 2 : // Case 2: Paint region from x=d[i][0] to x=W (exclusive).
                // This colors the right part of the rectangle.
                draw ( d [ i ] [ 0 ] , W , 0 , H ) ;
                break ; // Exit switch after drawing.

            case 3 : // Case 3: Paint region from y=0 to y=d[i][1] (exclusive).
                // This colors the bottom part of the rectangle.
                draw ( 0 , W , 0 , d [ i ] [ 1 ] ) ;
                break ; // Exit switch after drawing.

            case 4 : // Case 4: Paint region from y=d[i][1] to y=H (exclusive).
                // This colors the top part of the rectangle.
                draw ( 0 , W , d [ i ] [ 1 ] , H ) ;
                break ; // Exit switch after drawing.

            default : // No action for other cases (though not expected by problem spec).
                break ;
        }
    }

    // For debugging: print the final state of the 'rect' array.
    console . log ( rect )

    let result = 0 ; // Initialize counter for uncolored cells.

    // Iterate through each row in the 'rect' array.
    for ( const arr of rect ) {
        // Iterate through each value in the current row.
        for ( const v of arr ) {
            // If a cell's value is 0, it means it has not been colored.
            if ( v === 0 ) {
                result ++ // Increment the counter for uncolored cells.
            }
        }
    }

    // Print the final count of uncolored cells.
    console . log ( result ) ;
}


/**
 * Helper function to "draw" (increment value) within a specified rectangular region.
 * The region is defined by inclusive start coordinates and exclusive end coordinates.
 * @param {number} xStart - The starting X-coordinate (inclusive).
 * @param {number} xEnd   - The ending X-coordinate (exclusive).
 * @param {number} yStart - The starting Y-coordinate (inclusive).
 * @param {number} yEnd   - The ending Y-coordinate (exclusive).
 */
function draw ( xStart , xEnd , yStart , yEnd ) {
    // Loop through Y-coordinates (rows) from yStart up to yEnd (exclusive).
    for ( let y = yStart ; y < yEnd ; y ++ ) {
        // Loop through X-coordinates (columns) from xStart up to xEnd (exclusive).
        for ( let x = xStart ; x < xEnd ; x ++ ) {
            rect [ y ] [ x ] += 1 ; // Increment the value of the cell.
                                   // A non-zero value indicates it has been "colored".
        }
    }
}


// Read input from stdin and pass it to the Main function.
Main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;