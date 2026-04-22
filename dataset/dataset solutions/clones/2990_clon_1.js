function    Main( lines )
{
    // This function processes the input lines to solve a problem.
    // First, split the input string by newline characters.
    lines = lines . split ( "\n" ) ;

    // Extract dimensions (Height H and Width W) from the first line.
    var tmp = lines [ 0 ] . split ( " " ) ;
    var H   = Number ( tmp [ 0 ] ) ; // Height of the grid
    var W   = Number ( tmp [ 1 ] ) ; // Width of the grid

    // Initialize a queue 'q' for BFS and a 2D array 'l' for the grid.
    var q = [ ] ;
    var l = Array ( H ) . fill ( 0 ) . map ( i => i = Array ( W ) . fill ( 0 ) ) ;
    // The 'l' array will store the grid state.

    // Populate the grid 'l' from input lines and initialize the queue 'q'
    // with starting points (cells marked '#').
    for ( var i = 1 ; i <= H ; i ++ )
    {
        l [ i - 1 ] = lines [ i ] . split ( "" ) ; // Copy characters into the grid row.
        for ( var j = 0 ; j < W ; j ++ )
        {
            // If a cell contains '#', it's a starting point for the spread.
            if ( l [ i - 1 ] [ j ] === "#" )
            {
                q . push ( [ i - 1 , j ] ) ; // Add its coordinates to the queue.
            }
        } // End of inner loop for columns
    } // End of outer loop for rows

    // Initialize the answer variable.
    var ans = 0 ; // This will count the number of expansion steps.

    // Perform a Breadth-First Search (BFS) to simulate the spread.
    while ( q . length )
    {
        ans ++ ; // Increment the step counter for each expansion level.
        var qq = q . concat ( ) ; // Create a copy of the current queue for processing this level.

        // Process all elements in the current level of the queue.
        for ( var i = 0 ; i < q . length ; i ++ )
        {
            var a = qq . shift ( ) ; // Get the coordinates of the current cell.
            var y = a [ 0 ] , x = a [ 1 ] ; // Deconstruct coordinates into y (row) and x (column).

            // Check adjacent cells (up, down, left, right) for expansion.

            // Check cell below
            if ( 0 <= y + 1 && y + 1 < H )
            {
                if ( l [ y + 1 ] [ x ] === "." )
                {
                    l [ y + 1 ] [ x ] = "#" ; // Mark as visited/spread to.
                    qq . push ( [ y + 1 , x ] ) ; // Add to the next level's queue.
                }
            }

            // Check cell above
            if ( 0 <= y - 1 && y - 1 < H )
            {
                if ( l [ y - 1 ] [ x ] === "." )
                {
                    l [ y - 1 ] [ x ] = "#" ; // Mark as visited.
                    qq . push ( [ y - 1 , x ] ) ; // Add to queue for next iteration.
                }
            }

            // Check cell to the right
            if ( 0 <= x + 1 && x + 1 < W )
            {
                if ( l [ y ] [ x + 1 ] === "." )
                {
                    l [ y ] [ x + 1 ] = "#" ; // Mark as visited.
                    qq . push ( [ y , x + 1 ] ) ; // Add to queue.
                }
            }

            // Check cell to the left
            if ( 0 <= x - 1 && x - 1 < W )
            {
                if ( l [ y ] [ x - 1 ] === "." )
                {
                    l [ y ] [ x - 1 ] = "#" ; // Mark as visited.
                    qq . push ( [ y , x - 1 ] ) ; // Add to queue.
                }
            }

        } // End of inner loop for current queue level

        q = qq . concat ( ) ; // Update the main queue for the next level's processing.
    } // End of while loop (BFS)

    // The answer is the number of steps minus one, as the initial state is step 0.
    console . log ( ans - 1 ) ;
} ; // End of Main function

// This line reads input from standard in and passes it to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;