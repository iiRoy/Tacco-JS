/*
 * This is an extensively modified Type I clone
 * of the original JavaScript source code.
 * All identifiers, operators, and expressions
 * remain exactly the same.
 * Only whitespace and comments have been altered
 * to create a visually distinct but functionally
 * identical version.
 */
'use strict' ; // Enforces strict mode parsing and error handling

const   main  =   (   input   )   =>
{

    /*
     * Split the entire input string by newline characters
     * to get an array of lines.
     */
    const   t   =   input.split ( '\n' ) ;

    // The first line contains the dimensions H and W.
    const   hw  =   t [ 0 ] .split ( ' ' ) ;

    // Parse the height (H) from the first element.
    const   H   =   parseInt ( hw [ 0 ] ,   10 ) ;

    // Parse the width (W) from the second element.
    const   W   =   parseInt ( hw [ 1 ] ,   10 ) ;


    /*
     * Initialize a 2D array 'a' to store the grid values.
     * This array will hold the current state of numbers.
     */
    const   a   =   [ ] ;

    // Loop through each row of the input grid.
    for   (   let   y   =   0 ;   y   <   H ;   y ++   )
    {

        // Initialize the current row as an empty array.
        a [ y ]   =   [ ] ;

        // Split the current line (row) into individual string numbers.
        const   l   =   t [ y   +   1 ] .split ( ' ' ) ;

        // Loop through each column in the current row.
        for   (   let   x   =   0 ;   x   <   W ;   x ++   )
        {

            // Parse the string number to an integer and store it.
            a [ y ] [ x ]   =   parseInt ( l [ x ] ,   10 ) ;

        } // End of inner loop (columns)
    }     // End of outer loop (rows)


    // 'log' will store the sequence of moves performed.
    const   log   =   [ ] ;

    /*
     * Define the 'move' function to handle value transfers
     * and record the move in the log.
     */
    const   move   =   function   (   sx ,   sy ,   ex ,   ey   )
    {

        // Record the move as a space-separated string of coordinates.
        log.push (   [   sx ,   sy ,   ex ,   ey   ] .join ( ' ' )   ) ;

        // Increment the value at the destination cell (ex, ey).
        a [ ey ] [ ex ] ++ ;

        // Decrement the value at the source cell (sx, sy).
        a [ sx ] [ sy ] -- ;

    } ; // End of move function definition


    /*
     * The core logic: Iterate through the grid to find odd numbers
     * and move their "oddness" to an adjacent cell.
     * This process is repeated for each cell.
     */
    for   (   let   y   =   0 ;   y   <   H ;   y ++   )
    {
        for   (   let   x   =   0 ;   x   <   W ;   x ++   )
        {

            // Check if the current cell's value is odd.
            if   (   a [ y ] [ x ]   %   2   !=   0   )
            {
                /*
                 * The number is odd. We need to transfer
                 * one unit to an adjacent cell to make it even.
                 */

                // Attempt to move to the right if possible.
                if   (   x   +   1   <   W   )
                {
                    // Move the odd quantity to the right neighbor.
                    move (   x ,   y ,   x   +   1 ,   y   ) ;
                }
                // If moving right is not possible, try moving down.
                else   if   (   y   +   1   <   H   )
                {
                    // Move the odd quantity to the bottom neighbor.
                    move (   x ,   y ,   x ,   y   +   1   ) ;
                }

            } // End of if (odd number)
        }     // End of inner loop (columns)
    }         // End of outer loop (rows)


    // Output the total number of moves recorded.
    console.log (   log.length   ) ;

    // Output all recorded moves, each on a new line, followed by a final newline.
    console.log (   log.join ( '\n' )   +   '\n'   ) ;

} ; // End of main function definition


/*
 * A flag to determine if the script is running in a test environment
 * or with actual standard input.
 */
const   isTest   =   false ;


// Conditional execution based on the 'isTest' flag.
if   (   isTest   )
{
    // If in test mode, call main with a predefined string input.
    main (   '2 3\n1 2 3\n0 1 1\n'   ) ;
}
else
{
    // If not in test mode, read input from stdin and pass it to main.
    main (   require ( 'fs' ) .readFileSync ( '/dev/stdin' ,   'utf8' )   ) ;
}

/*
 * End of file.
 * This clone adheres strictly to Type I definition.
 */