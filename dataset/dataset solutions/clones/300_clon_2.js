( function ( rawContent ) { // Main execution block receives raw input text
    /**
     * Checks if a square region in the gridMap is entirely composed of empty spaces.
     * @param {number} colIdx      The starting column index of the potential square.
     * @param {number} rowIdx      The starting row index of the potential square.
     * @param {number} sideLength  The length of one side of the square to check.
     * @returns {boolean}          True if the square is clear, false otherwise.
     */
    function checkSquare( colIdx , rowIdx , sideLength )
    {
        // Iterate through rows within the defined square
        for ( let currentRow = rowIdx ; currentRow <= rowIdx + sideLength ; currentRow++ ) {
            // Iterate through columns within the defined square
            for ( let currentCol = colIdx ; currentCol <= colIdx + sideLength ; currentCol++ ) {
                // If any cell within the square is not an empty character ('.')
                if ( gridMap [ currentRow ] [ currentCol ] !== '.' )
                {
                    return false ; // The square is not clear
                }
            }
        }
        return true ; // All cells are clear, it's a valid empty square
    }


    // Process the initial input string into an array of lines, removing carriage returns
    let lineSegments = rawContent.replace( /\r/g , '' ) .split( "\n" ) ,
        gridMap ,                      // Represents the 2D grid of characters
        dimension ,                    // Stores the size of the square grid (N x N)
        rowIter ,                      // General purpose row iterator
        colIter ;                      // General purpose column iterator


    // Loop indefinitely until an explicit break condition is met
    while ( true )
    {
        // Parse the first line segment as the grid dimension
        dimension = Number.parseInt( lineSegments.shift() ) ;

        // If the dimension is zero, it's the termination signal
        if ( dimension === 0 )
        {
            break ; // Exit the main processing loop
        }

        gridMap = [ ] ; // Initialize an empty array to hold the grid rows
        // Populate the grid map with 'dimension' number of rows
        for ( rowIter = 0 ; rowIter < dimension ; rowIter++ )
        {
            gridMap.push( lineSegments.shift() ) ; // Add the next line as a row
        }

        // // Optional: Debugging output for the constructed grid
        // console.log( gridMap ) ;
        // // Optional: Debugging output for a specific square check
        // console.log( checkSquare( 3 , 3 , 5 ) ) ;

        // Initialize the current square size we are trying to find
        let currentSquareSize = 1 ;

        // Iterate through each possible starting row of a square
        for ( rowIter = 0 ; rowIter < dimension ; rowIter++ )
        {
            // Iterate through each possible starting column of a square
            for ( colIter = 0 ; colIter < dimension ; )
            {
                // Check if a square of 'currentSquareSize' starting at (colIter, rowIter) is clear
                if ( checkSquare( colIter , rowIter , currentSquareSize ) )
                {
                    // // Debugging: Found a square
                    // console.log( "Found clear square!" , colIter , rowIter , currentSquareSize ) ;
                    currentSquareSize++ ; // Increase the size to search for a larger square
                }
                else
                {
                    // // Debugging: Square not clear
                    // console.log( "Square not clear!" , colIter , rowIter , currentSquareSize ) ;
                    colIter += currentSquareSize ; // Move to the next potential starting column, skipping the current square's width
                }
            }
        }
        // Output the final maximum square size found for the current grid
        console.log( currentSquareSize ) ;
    }
} ) ( require( "fs" ) .readFileSync( "/dev/stdin" , "utf8" ) ) ; // Immediately invoked function expression with file system input