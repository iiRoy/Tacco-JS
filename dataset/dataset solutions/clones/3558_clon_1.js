/* This is a Type I clone of the original JavaScript code.
 * It strictly adheres to the definition: "Code fragments are exactly equal,
 * except for possible variations in whitespace and comments."
 *
 * This means all identifiers, variable names, function names, operators,
 * and expressions remain completely unchanged.
 *
 * Extensive modifications have been made to whitespace (indentation, spacing,
 * blank lines) and comments (addition, modification, removal)
 * to ensure the resulting code looks visually distinct while
 * maintaining identical logic and structure.
 */

'use strict' ; // Ensure strict mode for the entire script.

// The main function to process the input data.
const main = ( input ) =>
{

    // Split the input string into an array of lines.
    const t = input . split ( '\n' ) ;

    // Parse the first line to get dimensions H and W.
    const hw = t [ 0 ] . split ( ' ' ) ;

    // Convert height string to an integer.
    const H = parseInt ( hw [ 0 ] , 10 ) ;

    // Convert width string to an integer.
    const W = parseInt ( hw [ 1 ] , 10 ) ;

    // Initialize a 2D array 'a' to store the grid values.
    const a = [ ] ;

    // Loop through each row to populate the 2D array.
    for ( let y = 0 ; y < H ; y ++ )
    {
        // Initialize the current row as an empty array.
        a [ y ] = [ ] ;

        // Split the current line of input into individual numbers.
        const l = t [ y + 1 ] . split ( ' ' ) ;

        // Loop through each column in the current row.
        for ( let x = 0 ; x < W ; x ++ )
        {
            // Parse the number and store it in the 2D array.
            a [ y ] [ x ] = parseInt ( l [ x ] , 10 ) ;
        }
    }

    // Initialize an array to store the log of moves.
    const log = [ ] ;

    // Define a helper function to record a move and update the grid.
    const move = function ( sx , sy , ex , ey )
    {
        // Push the move coordinates (1-indexed) as a space-separated string to the log.
        log . push ( [ sy + 1 , sx + 1 , ey + 1 , ex + 1 ] . join ( ' ' ) ) ;

        // Increment the value at the destination cell.
        a [ ey ] [ ex ] ++ ;

        // Decrement the value at the source cell.
        a [ sy ] [ sx ] -- ;
    } ;

    // The core logic: iterate through the grid to handle odd numbers.
    // If a cell contains an odd number, move one unit to an adjacent cell.
    for ( let y = 0 ; y < H ; y ++ )
    {
        for ( let x = 0 ; x < W ; x ++ )
        {
            // Check if the current cell's value is odd.
            if ( a [ y ] [ x ] % 2 != 0 )
            {
                // If it's an odd number...

                // Try to move to the right if possible (within bounds).
                if ( x + 1 < W )
                {
                    // Move to the right.
                    move ( x , y , x + 1 , y ) ;
                }
                // Otherwise, if moving right is not possible, try to move down.
                else if ( y + 1 < H )
                {
                    // Move downwards.
                    move ( x , y , x , y + 1 ) ;
                }
            }
        }
    }

    // Output the total number of moves made.
    console . log ( log . length ) ;

    // Output all recorded moves, each on a new line, followed by an additional newline.
    console . log ( log . join ( '\n' ) + '\n' ) ;
} ;

// A flag to determine if the script is running in test mode.
const isTest = false ;

// Conditional execution based on the 'isTest' flag.
if ( isTest )
{
    // If in test mode, call main with a predefined test input.
    main ( '2 3\n1 2 3\n0 1 1\n' ) ;
}
else
{
    // If not in test mode, read input from stdin and call main.
    // This requires the 'fs' module for file system operations.
    main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;
}