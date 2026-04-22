/*
 * This is an example of a Type I code clone.
 * It strictly adheres to the definition:
 * - Identifiers, operators, expressions are unchanged.
 * - Only whitespace and comments are modified.
 * The goal is to make it visually distinct from the original.
 */
function         Main
    (
        input
    )
{
    // Process the input string: trim whitespace and split into lines.
    input = input.trim().split("\n");

    /*
     * Extract grid dimensions (R, C) and number of items (n).
     * The first line of input contains these values, separated by spaces.
     * Each value is parsed as an integer.
     */
    const [  R  ,  C  ,  n  ] = input.shift().split(" ").map(( a ) => parseInt(a, 10));


    // Parse the remaining input lines into a 2D array of item values.
    const values = input.map( ( a ) => a.split(" ").map( ( b ) => parseInt(b, 10) ) );


    // Declare loop counter variables.
    let i, j, k;

    // Initialize arrays 'a' and 'dp'.
    a = [];
    dp = [];

    // Initialize the dynamic programming table 'dp'.
    // It's a 3D array of size 3005 x 3005 x 4, filled with zeros.
    for
        (
            i = 0;
            i < 3005;
            i++
        )
    {
        const array = []; // Temporary array for the current row.

        for
            (
                j = 0;
                j < 3005;
                j++
            )
        {
            array.push([0, 0, 0, 0]); // Each cell stores an array of 4 zeros.
        }
        dp.push(array); // Add the completed row to the dp table.
    }


    /*
     * Populate the 'a' array with item values.
     * 'a' acts as a sparse matrix for quick lookup of item values at (r, c).
     * The input coordinates (r, c) are 1-based, so we adjust to 0-based.
     */
    for (let i = 0; i < n; i++)
    {
        const [r, c, v] = values[i]; // Destructure item row, column, and value.

        // Ensure the row exists before accessing its elements.
        a[r - 1] = a[r - 1] || [];

        // Store the value 'v' at the adjusted coordinates (r-1, c-1).
        a[r - 1][c - 1] = v;
    }


    /*
     * Core dynamic programming logic.
     * Iterates through each cell (i, j) of the grid.
     */
    for
    (
        i = 0;
        i < R;
        i++
    )
    {
        for
        (
            j = 0;
            j < C;
            j++
        )
        {
            // First inner loop: Calculate maximum value considering taking an item.
            // Iterates backwards from k=2 to k=0.
            for
            (
                k = 2;
                k >= 0;
                k--
            )
            {
                // Update dp[i][j][k+1] with the maximum of its current value
                // and the value from dp[i][j][k] plus the item value at (i, j) if it exists.
                dp[i][j][k+1] = Math.max(  dp[i][j][k+1],  dp[i][j][k]    +    (a[i]  &&  a[i][j]  ||  0)  );
            }

            // Second inner loop: Propagate values to adjacent cells (down and right).
            // Iterates from k=0 to k=3.
            for
            (
                k = 0;
                k < 4;
                k++
            )
            {
                // Propagate to the cell directly below (i+1, j), resetting the 'k' dimension to 0.
                dp[i+1][j][0] = Math.max(  dp[i+1][j][0],  dp[i][j][k]  );

                // Propagate to the cell directly to the right (i, j+1), maintaining the 'k' dimension.
                dp[i][j+1][k] = Math.max(  dp[i][j+1][k],  dp[i][j][k]  );
            }
        }
    }


    // Calculate the final answer.
    // The answer is the maximum value in the last cell of the dp table (R-1, C-1)
    // across all 'k' dimensions.
    let ans = 0;
    for
        (
            k = 0;
            k < 4;
            k++
        )
    {
        ans = Math.max(  ans,  dp[R-1][C-1][k]  );
    }

    // Output the final answer to the console.
    console.log(ans);
}

// Invoke the Main function with input read from standard input.
Main(  require("fs").readFileSync("/dev/stdin", "utf8")  );