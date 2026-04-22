( function (   input   )   {
        // This is the main immediately invoked function expression (IIFE).
        // It processes a series of test cases from the given 'input' string.
        // The input is expected to be a multi-line string.


    function isFill  (  size  )
    {
        // This function checks if the entire 'data' grid, of dimensions 'size' x 'size',
        // is completely filled with the '*' character.
        // It returns 'true' if all cells are '*', otherwise 'false'.

        for ( var i = 0 ; i < size ; i++ )
        {
                for ( var j = 0 ; j < size ; j++ )
                {
                        // Check each individual cell in the grid.
                        if ( data[i][j] !== '*' )
                        {
                            // If we find any character that is NOT an asterisk,
                            // then the grid is not completely filled.
                            return false;
                        }
                }
        }
        // If the loops complete without returning 'false', it means all cells were '*'.
        return true;
    }


    function isRect  (  x  ,  y  ,  size  )
    {
        // This function determines if a square region of the 'data' grid,
        // starting at coordinates (x, y) and having dimensions 'size' x 'size',
        // consists entirely of the '.' (dot) character.
        // 'x' is the starting column index, 'y' is the starting row index.

        for ( var i = y ; i <= y + size ; i++ )
        {
                for ( var j = x ; data[i] && j <= x + size ; j++ )
                {
                    // The 'data[i]' check is important to prevent out-of-bounds errors
                    // if 'i' somehow exceeds the array dimensions, though 'data' is assumed square.

                    // console.log(size, i, y); // Original debug comment, removed for clarity.

                    if ( data[i][j] !== '.' )
                    {
                        // If any character within the potential rectangle's bounds
                        // is not a dot, then it's not a valid rectangle of dots.
                        return false;
                    }
                }
        }
        // If we've iterated through all cells in the specified region and found only dots,
        // then it is indeed a valid rectangle.
        return true;
    }



    // Declare and initialize variables needed for processing the input.
    var inputs = input.replace( /\r/g , '' ).split( "\n" ), // Remove carriage returns and split by newline.
        data, // Will hold the current grid for a test case.
        n,    // Will hold the size of the current grid (n x n).
        i,    // Loop counter for rows.
        j;    // Loop counter for columns.


    while ( true )
    {
        // This loop processes multiple test cases until a termination condition is met.

        n = parseInt( inputs.shift() ); // Read the first line of the current test case, which is 'n'.
                                        // 'shift()' removes the element from the 'inputs' array.

        if ( n === 0 )
        {
            // If 'n' is 0, it indicates the end of the input stream.
            break; // Exit the infinite 'while' loop.
        }

        data = []; // Initialize an empty array to store the grid rows for the current test case.

        for ( i = 0 ; i < n ; i++ )
        {
            // Read 'n' subsequent lines, each representing a row of the grid.
            data.push( inputs.shift() );
        }

        if ( isFill( n ) )
        {
            // If the entire grid is filled with '*' characters,
            // then the answer is 0 according to the problem statement.
            console.log( 0 );
        }
        else
        {
            // If the grid is not entirely filled with asterisks,
            // we need to find the largest possible 'size' for a square of '.' characters
            // that can tile the grid based on the problem's logic.

            // console.log(data); // Debugging output, removed.
            // console.log(isRect(3, 3, 5)); // More debugging, removed.

            var size = 1; // Start with a square size of 1. This 'size' will be incremented.

            for ( i = 0 ; i < n ; i++ )
            {
                // Iterate through each row of the grid.
                for ( j = 0 ; j < n ; )
                {
                    // Iterate through each column. Note that 'j' is not incremented in the for-loop header;
                    // its increment depends on the 'isRect' check result.

                    if ( isRect( j , i , size ) )
                    {
                        // If a rectangle of the current 'size' composed entirely of '.' characters
                        // is found starting at (j, i).
                        // console.log("rect!", j, i, size); // Original debug comment, modified.
                        // A valid rectangle was found. We can try for a larger size.
                        size++; // Increment 'size' to test for larger squares in subsequent checks.
                    }
                    else
                    {
                        // If no rectangle of the current 'size' is found at (j, i).
                        // console.log("not rect!", j, i, size); // Original debug comment, modified.
                        // The current position (j, i) cannot be the top-left of a '.' rectangle of this 'size'.
                        // We advance 'j' by 'size' to check the next non-overlapping potential starting point.
                        j += size;
                    }
                }
            }
            // After iterating through the entire grid, 'size' will hold the maximum value
            // determined by the problem's logic.
            console.log( size ); // Output the final calculated size.
        }
    }

})( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ) );
// The IIFE is called immediately with the content of /dev/stdin.
// 'require("fs").readFileSync("/dev/stdin", "utf8")' reads the standard input
// synchronously as a UTF-8 encoded string.