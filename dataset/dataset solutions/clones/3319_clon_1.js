/*
 * This JavaScript code calculates the number of unique paths
 * from the top-left corner to the bottom-right corner
 * of a grid, avoiding obstacles ('#').
 *
 * It reads grid dimensions and layout from standard input.
 * Dynamic programming is used to efficiently compute the paths.
 */
console.log ( function ( args ) { /* Main anonymous function starts here */

    // Parse the input string into an array of grid rows.
    const map = args . trim ( ) . split ( '\n' ) ;


    // Extract grid dimensions (Height H, Width W) from the first row.
    // The 'shift()' method removes the first element (dimensions) from 'map'.
    // 'v=>v|0' is a concise way to convert string to integer, ensuring numerical values.
    const [ H , W ] = map . shift ( ) . split ( ' ' ) . map ( v => v | 0 ) ;


    // Initialize a 2D array (dp table) to store the number of paths to each cell.
    // All cells are initially set to 0.
    const dp = Array ( H ) . fill ( 0 ) . map ( r => Array ( W ) . fill ( 0 ) ) ;


    // There is always 1 way to reach the starting cell (0,0).
    // This is the base case for our dynamic programming approach.
    dp [ 0 ] [ 0 ] = 1 ;


    // Iterate through each cell of the grid to fill the dp table.
    // 'h' represents the current row index, ranging from 0 to H-1.
    for ( let h = 0 ; h < H ; h ++ ) {

        // 'w' represents the current column index, ranging from 0 to W-1.
        for ( let w = 0 ; w < W ; w ++ ) {

            // If the current cell is an obstacle ('#'), no paths can go through it.
            // So, we skip it and continue to the next cell.
            if ( map [ h ] [ w ] === '#' )
                continue ;


            // If we are not in the first row (h > 0),
            // add paths from the cell directly above (h-1, w).
            // The result is taken modulo (1e9+7) to prevent integer overflow for large numbers.
            if ( h > 0 )
                dp [ h ] [ w ] = ( dp [ h ] [ w ] + dp [ h - 1 ] [ w ] ) % ( 1e9 + 7 ) ;


            // If we are not in the first column (w > 0),
            // add paths from the cell directly to the left (h, w-1).
            // Again, apply modulo for large results to keep values within bounds.
            if ( w > 0 )
                dp [ h ] [ w ] = ( dp [ h ] [ w ] + dp [ h ] [ w - 1 ] ) % ( 1e9 + 7 ) ;

        } // End of inner loop (columns)

    } // End of outer loop (rows)


    // The final answer is the number of paths to the bottom-right cell (H-1, W-1).
    // Convert the numerical result to a string as per typical competitive programming output requirements.
    return dp [ H - 1 ] [ W - 1 ] . toString ( ) ;

} ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ) ; /* End of anonymous function call and console.log */