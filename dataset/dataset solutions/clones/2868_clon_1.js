/*
 * This JavaScript program is designed to identify the maximum possible number
 * of squares that can be illuminated by a single lamp within a given grid.
 * The grid is represented by an array of characters, where '.' denotes an empty
 * square and '#' signifies an obstacle. A lamp placed on an empty square
 * illuminates all other empty squares in its cardinal directions (up, down,
 * left, right) until it encounters an obstacle or the boundary of the grid.
 *
 * This implementation adheres strictly to the problem definition, calculating
 * the illumination for each possible lamp placement and determining the global maximum.
 */
"use strict" /* This directive enables strict mode, applying stricter rules for parsing and error handling in JavaScript code. */ ;


function Main ( input )
{
    // The primary function orchestrating the entire process of reading input,
    // processing the grid, and finding the maximum illuminated squares.

    input = input . split ( '\n' ) ; // Divide the raw input string into an array, where each element is a line from the input.


    // The first line of input typically contains the maze dimensions,
    // which are extracted and processed here.
    // Note: The 'map' function callback does not explicitly return a value,
    //       so 'parseInt(a)' is executed but its result is not used to
    //       transform the array elements. This behavior is preserved as per Type I cloning rules.
    let mazeSize = input . shift ( )                   // Remove the first line from the input array and retrieve it.
                         . split ( ' ' )                // Split this first line by spaces to get individual dimension strings.
                         . map ( function ( a )         // Apply a function to each dimension string.
                            {
                                parseInt ( a ) ;        // Attempt to parse the string to an integer; result is implicitly discarded.
                            } ) ;


    // Original commented-out map operation, preserved as a comment to reflect the original code's structure.
    /*
    // input = input . map ( function ( a ) {
    //     a = a . split ( '' ) ;
    // } ) ;
    */


    // Iterate through the remaining input lines to convert each string into an array of characters,
    // effectively forming a 2D grid (maze).
    input . forEach ( function ( part , index , array )
    {
        array [ index ] = array [ index ] . split ( '' ) ; // Each line string becomes an array of its constituent characters.
    } ) ;


    // Original debug console log statement, now fully commented out.
    // console . log ( input ) ;


    let maxLightSq = 0 ; // Initialize a variable to keep track of the highest number of lighted squares found.


    // Begin the exhaustive search: iterate over every cell in the grid.
    for ( let y = 0 ; y < input . length ; y++ )
    {
        for ( let x = 0 ; x < input [ 0 ] . length ; x++ )
        {
            // Check if the current cell is an empty square ('.'),
            // indicating it's a valid position to place a lamp.
            if ( input [ y ] [ x ] === '.' )
            {
                // Calculate the number of squares lit if a lamp is placed at (x, y).
                let lightSq = cardinalLightNumber ( input , [ x , y ] ) ;

                // Update 'maxLightSq' if the current lamp position illuminates more squares
                // than any previously considered position. This is a ternary operation.
                maxLightSq = maxLightSq > lightSq
                             ? maxLightSq
                             : lightSq ;
            }
        }
        // Original debug console log statement for line processing, now fully commented out.
        // console . log ( "next line." ) ;
    }


    let result = maxLightSq ; // Assign the final maximum value to a 'result' variable.

    console . log ( result ) ; // Output the computed maximum number of lighted squares to the console.
} // End of the Main function definition.


/*
 * This auxiliary function computes the total number of squares illuminated
 * by a lamp placed at a specific 'pos' (position [x, y]) within the 'arr' grid.
 * Illumination extends in cardinal directions until an obstacle ('#') or grid boundary is met.
 */
function cardinalLightNumber ( arr , pos )
{
    let x = pos [ 0 ] , // Extract the x-coordinate (column index) from the position array.
        y = pos [ 1 ] ; // Extract the y-coordinate (row index) from the position array.


    // Original debug console log, now commented out.
    // console . log ( x + ", " + y ) ;


    let num = 1 ; // Start the count at 1, accounting for the square where the lamp itself is placed.


    // Traverse upwards from the lamp's position (decreasing y-coordinate).
    for ( let i = y - 1 ; i >= 0 ; i-- )
    {
        if ( arr [ i ] [ x ] === '.' ) // If the square is empty, increment the count.
        {
            num++ ;
        }
        else if ( arr [ i ] [ x ] === '#' ) // If an obstacle is encountered, stop further illumination in this direction.
        {
            break ;
        }
    }


    // Traverse downwards from the lamp's position (increasing y-coordinate).
    for ( let i = y + 1 ; i < arr . length ; i++ )
    {
        if ( arr [ i ] [ x ] === '.' ) // If the square is empty, increment the count.
        {
            num++ ;
        }
        else if ( arr [ i ] [ x ] === '#' ) // If an obstacle is encountered, stop.
        {
            break ;
        }
    }


    // Traverse leftwards from the lamp's position (decreasing x-coordinate).
    for ( let i = x - 1 ; i >= 0 ; i-- )
    {
        if ( arr [ y ] [ i ] === '.' ) // If the square is empty, increment the count.
        {
            num++ ;
        }
        else if ( arr [ y ] [ i ] === '#' ) // If an obstacle is encountered, stop.
        {
            break ;
        }
    }


    // Traverse rightwards from the lamp's position (increasing x-coordinate).
    for ( let i = x + 1 ; i < arr [ 0 ] . length ; i++ )
    {
        if ( arr [ y ] [ i ] === '.' ) // If the square is empty, increment the count.
        {
            num++ ;
        }
        else if ( arr [ y ] [ i ] === '#' ) // If an obstacle is encountered, stop.
        {
            break ;
        }
    }


    // Original debug console log, now commented out.
    // console . log ( "Number of light squares at(" + pos +"): " + num ) ;


    return num ; // Return the total number of squares illuminated by the lamp at 'pos'.
} // End of the cardinalLightNumber function.


// This line invokes the Main function, providing it with input read asynchronously
// from standard input (typically '/dev/stdin' on Unix-like systems).
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;


// Original alternative invocation for reading from a file, now commented out.
// Main ( require ( "fs" ) . readFileSync ( "Task04input.txt" , "utf8" ) ) ;