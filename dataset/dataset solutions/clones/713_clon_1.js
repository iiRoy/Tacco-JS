/* This is the global array 'fin', initialized to an empty array.
   It will be used to keep track of visited cells or
   to store some final state for each cell. */
var fin = [];

// Initialize the 'fin' array with 50 empty arrays.
// This effectively creates a 2D array structure.
for ( var i = 0 ; i < 50 ; i++ ) {
    fin[i] = []; /* Each element 'fin[i]' is an array itself. */
}

/* These arrays define the 8 possible directions
   (including diagonals) from a given cell (x, y)
   in a 2D grid. dx represents changes in the x-coordinate. */
var dx = [ 1 , 1 , 1 , 0 , 0 , -1 , -1 , -1 ];

/* dy represents changes in the y-coordinate for the 8 directions. */
var dy = [ 1 , 0 , -1 , 1 , -1 , 1 , 0 , -1 ];

/*
 * This is a Depth-First Search (DFS) function.
 * It explores connected components in a grid-like map.
 *
 * @param {number} i   - The current row index.
 * @param {number} j   - The current column index.
 * @param {number} h   - The height of the map.
 * @param {number} w   - The width of the map.
 * @param {Array<Array<number>>} map - The 2D map array.
 */
function dfs( i , j , h , w , map )
{
    // Mark the current cell as visited or processed by setting its 'fin' status to false.
    fin[ i ][ j ] = false ;

    /* Iterate through all 8 possible directions. */
    for ( var k = 0 ; k < 8 ; k++ )
    {
        // Calculate the coordinates of the neighbor cell.
        var ii = i + dx[ k ] ;
        var jj = j + dy[ k ] ;

        // Check if the neighbor cell is within the map boundaries,
        // if it's part of the land (map[ii][jj] == 1),
        // and if it hasn't been visited yet (fin[ii][jj] is true).
        if (
              ii >= 0
           && ii < h
           && jj >= 0
           && jj < w
           && map[ ii ][ jj ] == 1
           && fin[ ii ][ jj ]
        )
        {
            // If all conditions are met, recursively call dfs on the neighbor.
            dfs( ii , jj , h , w , map ) ;
        }
    }
}

/*
 * The main function that processes the input and solves the problem.
 *
 * @param {string} input - The raw input string containing map data.
 */
function Main( input )
{
    /* Split the input string by newlines to get an array of lines. */
    input = input . split( "\n" ) ;

    // Initialize a counter 'k' for iterating through input lines.
    var k = 0 ;

    /* The main processing loop, continues until a specific break condition is met. */
    while ( 1 )
    {
        // Split the current line of input by spaces to get width and height.
        input[ k ] = input[ k ] . split( " " ) ;

        // Parse the width from the first element of the split line.
        var w = parseInt( input[ k ][ 0 ] , 10 ) ;

        // Parse the height from the second element of the split line,
        // and then increment 'k' for the next line.
        var h = parseInt( input[ k++ ][ 1 ] , 10 ) ;

        // If both width and height are 0, it's the end of input, so break the loop.
        if ( w == 0 && h == 0 )
        {
            break ;
        }

        /* Initialize an empty array to store the map data for the current test case. */
        var map = [] ;

        // Loop through each row of the map.
        for ( var i = 0 ; i < h ; i++ )
        {
            // Initialize an empty array for the current row of the map.
            map[ i ] = [] ;

            // Split the current input line (which represents a map row) by spaces.
            input[ k ] = input[ k ] . split( " " ) ;

            // Loop through each column in the current row.
            for ( var j = 0 ; j < w ; j++ )
            {
                // Parse the integer value for the cell and store it in the map.
                map[ i ][ j ] = parseInt( input[ k ][ j ] , 10 ) ;
            }
            // Move to the next input line.
            k++ ;
        }

        /*
         * Initialize the 'fin' array for the current map.
         * All cells are initially marked as unvisited (true).
         */
        for ( var j = 0 ; j < h ; j++ )
        {
            for ( var l = 0 ; l < w ; l++ )
            {
                fin[ j ][ l ] = true ;
            }
        }

        // Initialize a variable to count the number of connected components (islands).
        sum = 0 ; /* 'sum' is implicitly global if not declared with 'var' or 'let'. */

        /* This loop continues until no more unvisited land cells are found. */
        while ( 1 )
        {
            // A flag to check if any unvisited land cells were found in the current pass.
            var flag = true ;

            // Iterate through each cell of the map.
            for ( var j = 0 ; j < h ; j++ )
            {
                for ( var l = 0 ; l < w ; l++ )
                {
                    // If a cell is land (1) and hasn't been visited yet (fin[j][l] is true).
                    if ( map[ j ][ l ] == 1 && fin[ j ][ l ] )
                    {
                        // Increment the island count.
                        sum++ ;
                        // Set flag to false because an unvisited land cell was found.
                        flag = false ;
                        // Start a DFS from this cell to mark all connected land cells as visited.
                        dfs( j , l , h , w , map ) ;
                    }
                }
            }
            // If no unvisited land cells were found in this pass, break the loop.
            if ( flag )
            {
                break ;
            }
        }
        // Print the total number of islands found for the current test case.
        console . log( sum ) ;
    }
}

// Read input from stdin and pass it to the Main function.
Main( require( "fs" ) . readFileSync( "/dev/stdin" , "utf8" ) ) ;