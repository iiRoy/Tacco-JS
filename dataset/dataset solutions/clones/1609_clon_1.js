function      Main   (  input  ) {
    // This is the main function that processes the input data.
    // It takes the raw input string as an argument.

    input = input . trim ( ) . split ( "\n" ) ; /* First, we clean up the input:
                                                  *   1. Remove leading/trailing whitespace.
                                                  *   2. Split the string into an array of lines.
                                                  */

    const [ R , C , n ] = input . shift ( ) . split ( " " ) . map ( ( a ) => parseInt ( a , 10 ) ) ;
    // Destructure the first line of input to get R (rows), C (columns), and n (number of values).
    // Each part is parsed as an integer with base 10. This line is crucial for setup.

    const values = input . map ( ( a ) => a . split ( " " ) . map ( ( b ) => parseInt ( b , 10 ) ) ) ;
    // The remaining lines represent the actual values.
    // Each line is split by space, and its elements are parsed as integers.
    // This creates an array of arrays, where each inner array is [r, c, v].

    let i , j , k ; // Declare loop control variables.
                     // They will be used in subsequent loops.

    a = [ ] ; // Initialize array 'a'. This will store the grid values.
              // It's effectively a sparse 2D array.

    dp = [ ] ; // Initialize array 'dp'. This will be our dynamic programming table.
               // It's a 3D array for state representation.


    // Populate the 'a' array with the given values.
    for ( let i = 0 ; i < n ; i ++ ) {
        /* Loop through each of the 'n' value entries. */

        const [ r , c , v ] = values [ i ] ; // Extract row, column, and value from the current entry.

        a [ r - 1 ] = a [ r - 1 ] || [ ] ; // Ensure the row array exists, initialize if not.
                                           // Using r-1 and c-1 for 0-based indexing.

        a [ r - 1 ] [ c - 1 ] = v ; // Assign the value 'v' to its correct position in the 'a' grid.
        // This makes 'a' a representation of the input grid with given values.
    }

    // Dynamic Programming calculation section.
    // This part computes the maximum possible sum of values based on specific traversal rules.
    for ( i = 0 ; i < R ; i ++ ) {
        // Iterate through each row 'i' from 0 to R-1.

        dp [ i ] = dp [ i ] || [ ] ; // Initialize dp[i] if it doesn't exist.
        dp [ i + 1 ] = dp [ i + 1 ] || [ ] ; // Initialize dp[i+1] for the next row.

        for ( j = 0 ; j < C ; j ++ ) {
            // Iterate through each column 'j' from 0 to C-1.

            // Initialize dp states for the current cell (i, j) and adjacent cells.
            // Each dp[i][j] stores an array of 4 values, representing different collection states.
            dp [ i ] [ j ] = dp [ i ] [ j ] || [ 0 , 0 , 0 , 0 ] ;
            dp [ i ] [ j + 1 ] = dp [ i ] [ j + 1 ] || [ 0 , 0 , 0 , 0 ] ;
            dp [ i + 1 ] [ j ] = dp [ i + 1 ] [ j ] || [ 0 , 0 , 0 , 0 ] ;

            // Loop for collecting items in the current cell (i, j).
            // This loop iterates downwards for 'k', considering different collection counts.
            for ( k = 2 ; k >= 0 ; k -- ) {
                // dp[i][j][k+1] stores the max value when collecting k+1 items up to (i,j).
                // It considers either not collecting the current item (dp[i][j][k+1] itself)
                // or collecting it (dp[i][j][k] + value_at_a[i][j]).
                dp [ i ] [ j ] [ k + 1 ] = Math . max ( dp [ i ] [ j ] [ k + 1 ] , dp [ i ] [ j ] [ k ] + ( a [ i ] && a [ i ] [ j ] || 0 ) ) ;
                // The (a[i] && a[i][j] || 0) ensures we only add a value if it exists at a[i][j], otherwise 0.
            }

            // Loop for propagating results to adjacent cells (i+1, j) and (i, j+1).
            for ( k = 0 ; k < 4 ; k ++ ) {
                // Propagate the maximum value from dp[i][j][k] to dp[i+1][j][0].
                // This means moving down to the next row, resetting item collection count to 0.
                dp [ i + 1 ] [ j ] [ 0 ] = Math . max ( dp [ i + 1 ] [ j ] [ 0 ] , dp [ i ] [ j ] [ k ] ) ;

                // Propagate the maximum value from dp[i][j][k] to dp[i][j+1][k].
                // This means moving right to the next column, maintaining the item collection count 'k'.
                dp [ i ] [ j + 1 ] [ k ] = Math . max ( dp [ i ] [ j + 1 ] [ k ] , dp [ i ] [ j ] [ k ] ) ;
                // This is a crucial step for moving the DP state forward.
            }
        }
    }

    let ans = 0 ; // Initialize the answer variable to 0.

    // After all DP calculations, find the maximum value in the final cell (R-1, C-1).
    for ( k = 0 ; k < 4 ; k ++ ) {
        // Iterate through all possible collection states (0 to 3) at the bottom-right cell.
        ans = Math . max ( ans , dp [ R - 1 ] [ C - 1 ] [ k ] ) ; // Update 'ans' with the maximum found.
    }

    console . log ( ans ) ; // Print the final maximum answer to standard output.
}

// This line reads input from standard input, decodes it as UTF-8, and passes it to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;
// End of file. This is where the program execution typically starts in competitive programming.