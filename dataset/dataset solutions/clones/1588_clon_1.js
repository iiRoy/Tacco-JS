/*
 * This JavaScript code implements an algorithm to find the maximum
 * number of targets that can be hit by selecting one row and one column
 * in a grid. It considers the case where the chosen row and column
 * might or might not have a target at their intersection.
 *
 * The program reads grid dimensions and target coordinates from standard input.
 * It then calculates the maximum count and prints it to standard output.
 */
(
    async    ()  =>      {

        // Declare a variable to store all incoming data from stdin.
        let    input   =   ''     ;


        // Asynchronously iterate over chunks of data received from the standard input stream.
        // Each chunk is appended to the 'input' string.
        for    await   ( const  chunk   of   process.stdin  )
        {
            input += chunk         ;
        }


        // Split the entire input string into an array of individual lines.
        // The split is performed using the newline character regex.
        const   lines   =    input .  split  (  /\n/  )        ;


        // Parse the first line of input to extract the grid's height (h), width (w),
        // and the total number of targets (m).
        // Each value is converted from string to number using the unary plus operator.
        const   [ h  ,  w  ,  m ]   =   lines[0] . split (/\s/) . map ( v => +v )        ;


        // Process the subsequent lines (from index 1 up to m+1) to get target coordinates.
        // Each line is split by whitespace, and each coordinate is converted to a 0-indexed number.
        const   targets   =   lines.slice(1, m + 1) . map ( line => line.split(/\s/) . map ( v => v - 1 ) )    ;


        // Initialize a 2-element array to store target counts for rows and columns.
        // targetCount[0] will store row counts (h elements), targetCount[1] for column counts (w elements).
        let   targetCount   =   [   new  Array(h) . fill(0)   ,   new  Array(w) . fill(0)   ]     ;


        // Initialize a 2D boolean array (grid map) to quickly check if a target exists at a specific coordinate.
        // It's filled with 'false' initially, indicating no targets are present.
        let   targetMap   =   new  Array(h) . fill([]) . map ( x => new Array(w) . fill(false) )      ;


        // Iterate through each target coordinate pair [row, column].
        for   ( const   target   of   targets   )
        {
            // Increment the target count for the corresponding row.
            targetCount[0][target[0]] ++       ;

            // Increment the target count for the corresponding column.
            targetCount[1][target[1]] ++       ;

            // Mark the target's position in the grid map as 'true'.
            targetMap[target[0]][target[1]]   =   true       ;
        }


        // Create a sorted copy of the row target counts in descending order.
        // The first element (xMax[0]) will be the maximum row target count.
        const   xMax   =   targetCount[0] . slice () . sort ( ( a , b ) => b - a )      ;

        // Create a sorted copy of the column target counts in descending order.
        // The first element (yMax[0]) will be the maximum column target count.
        const   yMax   =   targetCount[1] . slice () . sort ( ( a , b ) => b - a )      ;


        // Initialize an array to store the indices of columns that have the maximum target count (yMax[0]).
        let   yMaxs   =   []       ;

        // Loop through all possible column indices.
        for    (  let   i   =   0  ;   i   <   h  ;   i++  )
        {
            // If the current column's target count equals the maximum column target count,
            if (   targetCount[1][i]   ==   yMax[0]   )
            {
                // Add its index to the yMaxs array.
                yMaxs . push ( i )     ;
            }
        }


        // Initialize a flag variable. 'allCross' is 1 (true) if a target exists
        // at the intersection of a max row and a max column, and 0 (false) otherwise.
        let   allCross   =   1       ;


        // Iterate through each row index. The loop continues as long as 'allCross' is true.
        for    (  let   i   =   0  ;   i   <   h   &&   allCross  ;   i++  )
        {
            // If the current row's target count equals the maximum row target count,
            if (   targetCount[0][i]   ==   xMax[0]   )
            {
                // Then, iterate through all column indices that also have the maximum target count.
                for    (  let   j   =   0  ;   j   <   yMaxs.length  ;   j++  )
                {
                    // Check if there is NO target at the intersection of this maximum row (i)
                    // and this maximum column (yMaxs[j]).
                    if (   ! targetMap[i][yMaxs[j]]   )
                    {
                        // If no target is found at the intersection, set 'allCross' to 0 (false).
                        allCross   =   0       ;
                        // Break out of the inner loop as we've found a non-crossing case for this max row.
                        break      ;
                    }
                }
            }
        }


        // Finally, print the result to the console.
        // The result is the sum of the maximum row count and maximum column count,
        // adjusted by 'allCross'. If 'allCross' is 1, it means a target exists at an intersection
        // of a max row and a max column, so we subtract 1 to avoid double-counting.
        // If 'allCross' is 0, it means no such target exists, and we don't subtract anything (or subtract 0).
        console . log (   yMax[0]   +   xMax[0]   -   allCross   )      ;

    }
)(); // This is an Immediately-Invoked Function Expression (IIFE).