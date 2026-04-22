function CalculatePathways( rawInputData ) {
  // Normalize the incoming text data: trim, split by newlines, then split each line by spaces.
  const processedGridLines = rawInputData.trim() .split( "\n" ) .map( function ( singleLineText ) { return singleLineText.split( " " ) } ) ;

  // Define a large prime modulus for calculations to prevent integer overflow.
  const MOD_VALUE = ( 10 ** 9 ) + 7;

  // Extract grid dimensions from the first line of input.
  const gridDimensionHeight = parseInt( processedGridLines[ 0 ][ 0 ], 10 );
  const gridDimensionWidth = parseInt( processedGridLines[ 0 ][ 1 ], 10 );

  // Initialize a 2D array (dynamic programming matrix) to store path counts.
  // Each cell will initially hold zero.
  let dynamicPathMatrix = [];
  for ( let rowIterator = 0; rowIterator < gridDimensionHeight; rowIterator++ ) {
    dynamicPathMatrix.push( Array.from( { length: gridDimensionWidth }, () => 0 ) );
  }

  // The starting cell (top-left, [0][0]) has exactly one way to reach it (by being there).
  dynamicPathMatrix[ 0 ][ 0 ] = 1;

  // Iterate through "anti-diagonals" of the grid.
  // The sumOfCoordinates (row + col) ranges from 1 up to (height + width - 2).
  for ( let sumOfCoordinates = 1; sumOfCoordinates < gridDimensionHeight + gridDimensionWidth - 1; sumOfCoordinates++ ) {
    // For each anti-diagonal, iterate through possible row coordinates.
    // The row coordinate 'currentGridRow' must be within grid bounds and consistent with 'sumOfCoordinates'.
    for ( let currentGridRow = Math.max( 0, sumOfCoordinates - gridDimensionHeight ); currentGridRow <= Math.min( sumOfCoordinates, gridDimensionHeight - 1 ); currentGridRow++ ) {
      // Determine the corresponding column coordinate for the current cell.
      const currentGridColumn = sumOfCoordinates - currentGridRow;

      // Skip this cell if it's marked as an obstacle ('#') in the input grid.
      // Note: The actual grid content starts from processedGridLines[1].
      if ( processedGridLines[ currentGridRow + 1 ][ 0 ][ currentGridColumn ] === '#' ) {
        continue;
      }

      // Calculate path counts for the current cell based on paths from adjacent cells.
      // A path can come from the cell directly above (currentGridRow - 1, currentGridColumn)
      // or from the cell directly to the left (currentGridRow, currentGridColumn - 1).
      if ( currentGridRow > 0 && currentGridColumn > 0 ) {
        // If both above and left cells are valid, sum their path counts.
        dynamicPathMatrix[ currentGridRow ][ currentGridColumn ] = ( dynamicPathMatrix[ currentGridRow - 1 ][ currentGridColumn ] + dynamicPathMatrix[ currentGridRow ][ currentGridColumn - 1 ] ) % MOD_VALUE;
      } else if ( currentGridRow > 0 ) {
        // If only the cell above is valid (i.e., we are in the first column).
        dynamicPathMatrix[ currentGridRow ][ currentGridColumn ] = dynamicPathMatrix[ currentGridRow - 1 ][ currentGridColumn ];
      } else {
        // If only the cell to the left is valid (i.e., we are in the first row).
        dynamicPathMatrix[ currentGridRow ][ currentGridColumn ] = dynamicPathMatrix[ currentGridRow ][ currentGridColumn - 1 ];
      }
      // Debugging: uncomment to inspect the matrix state at each step.
      // console.log(dynamicPathMatrix);
    }
  }
  // Debugging: uncomment to inspect the final matrix before extraction.
  // console.log(dynamicPathMatrix);

  // The total number of unique paths to the bottom-right corner is stored in the last cell.
  // We use pop() twice to get the value from the last row's last element.
  console.log( dynamicPathMatrix.pop().pop() );
}

// Execute the main function by reading input from standard input.
CalculatePathways( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );