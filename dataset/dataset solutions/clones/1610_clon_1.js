function Main ( input ) {
    /*
     * This function processes the input string to solve a grid-based dynamic programming problem.
     * It parses dimensions, values, and then computes a maximum path sum.
     */

    // First, clean up the input string: trim whitespace and split into lines.
    input = input . trim ( ) . split ( "\n" ) ;

    // Extract grid dimensions (R rows, C columns) and the number of value entries (n).
    // The first line of input contains these three space-separated integers.
    const [ R , C , n ] = input . shift ( ) . split ( " " ) . map ( ( a ) => parseInt ( a , 10 ) ) ;

    // Parse the remaining input lines into a 2D array of values.
    // Each line represents an entry with (r, c, v).
    const values = input . map ( ( a ) => a . split ( " " ) . map ( ( b ) => parseInt ( b , 10 ) ) ) ;


    // Initialize 'a' as a sparse 2D array to store values at specific grid cells.
    // 'a' will effectively represent the grid with items.
    a = [ ] ;

    // Initialize 'dp' as a 3D array for dynamic programming.
    // dp[i][j][k] will store the maximum value achievable at cell (i, j)
    // having picked 'k' items from the current cell or previous cells in the row.
    dp = [ ] ;

    // Pre-allocate the dp array with dimensions up to 3005x3005x4.
    // This provides ample space for typical competitive programming constraints.
    for ( let i = 0 ; i < 3005 ; i ++ ) {
        const array = [ ] ; // Initialize a new row for the dp table.
        for ( let j = 0 ; j < 3005 ; j ++ ) {
            // Each cell will store an array of 4 elements (for k=0 to 3).
            array . push ( new Array ( 4 ) ) ;
        }
        dp . push ( array ) ; // Add the completed row to the dp table.
    }


    // Populate the 'a' array with the given values.
    // The input coordinates are 1-indexed, so we convert them to 0-indexed.
    for ( let i = 0 ; i < n ; i ++ ) {
        const [ r , c , v ] = values [ i ] ; // Destructure (row, column, value).

        // Ensure the row exists before trying to access its columns.
        a [ r - 1 ] = a [ r - 1 ] || [ ] ;

        // Assign the value 'v' to the cell (r-1, c-1).
        a [ r - 1 ] [ c - 1 ] = v ;
    }


    // This is the core dynamic programming loop.
    // It iterates through each cell (i, j) of the grid.
    for ( i = 0 ; i < R ; i ++ ) {

        for ( let j = 0 ; j < C ; j ++ ) {

            // Inner loop: Calculate dp values for picking items from the current cell (i, j).
            // 'k' represents the number of items already picked *before* considering the current cell.
            // We iterate k from 2 down to 0 to correctly propagate values.
            for ( let k = 2 ; k >= 0 ; k -- ) {
                // If we pick the item at (i, j), we add its value to the dp state
                // where k+1 items have been picked in the current row segment.
                dp [ i ] [ j ] [ k + 1 ] = Math . max ( dp [ i ] [ j ] [ k + 1 ] || 0 , ( dp [ i ] [ j ] [ k ] || 0 ) + ( a [ i ] [ j ] || 0 ) ) ;
            }


            // Inner loop: Propagate dp values to adjacent cells (down and right).
            // 'k' here represents the number of items picked up to the current cell (i, j).
            for ( k = 0 ; k < 4 ; k ++ ) {
                // When moving down to cell (i+1, j), the count of items resets to 0 for the new row.
                // We take the maximum of the current state at (i+1, j, 0) and the value from (i, j, k).
                dp [ i + 1 ] [ j ] [ 0 ] = Math . max ( dp [ i + 1 ] [ j ] [ 0 ] || 0 , dp [ i ] [ j ] [ k ] || 0 ) ;

                // When moving right to cell (i, j+1), the item count 'k' is carried over.
                // We take the maximum of the current state at (i, j+1, k) and the value from (i, j, k).
                dp [ i ] [ j + 1 ] [ k ] = Math . max ( dp [ i ] [ j + 1 ] [ k ] || 0 , dp [ i ] [ j ] [ k ] || 0 ) ;
            }

        }
    }


    // After filling the dp table, find the maximum value in the bottom-right cell.
    // This value represents the maximum total value achievable.
    let ans = 0 ;

    // Check all possible item counts (k=0 to 3) at the target cell (R-1, C-1).
    for ( k = 0 ; k < 4 ; k ++ ) {
        // Update 'ans' with the maximum value found.
        ans = Math . max ( ans , dp [ R - 1 ] [ C - 1 ] [ k ] ) ;
    }

    // Output the final answer to the console.
    console . log ( ans ) ;
}

// Call the Main function with input read from standard input.
// This is a common pattern for JavaScript competitive programming in Node.js.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;