function ProcessGridData ( rawTextContent ) {
  // Split the entire input string into an array of individual lines.
  const contentRows = rawTextContent.split( '\n' ) ;

  // Parse the grid dimensions (Height and Width) from the first line.
  // Using Number() for type conversion.
  const gridDimensions = contentRows[0].split( ' ' ).map( numericString => Number(numericString) );

  // Extract and parse the starting coordinates from the second line.
  const startCoordinates = contentRows[1].split( ' ' ).map( numericString => Number(numericString) );

  // Extract and parse the target (goal) coordinates from the third line.
  const targetCoordinates = contentRows[2].split( ' ' ).map( numericString => Number(numericString) );

  // Slice the content rows to get the actual map data, then split each row into characters.
  const pathfindingGrid = contentRows.splice( 3, gridDimensions[0] ).map( rowString => {
    return rowString.split( '' );
  } );

  // Initialize a queue for managing positions to be explored.
  const processingQueue = [];

  // This function explores a given grid cell and updates its path cost.
  const evaluateLocation = ( currentPosition, currentWarpCount ) => {
    const currentRowIndex = currentPosition[0];
    const currentColIndex = currentPosition[1];

    // Check if the current position is outside the grid boundaries.
    if (currentRowIndex < 0 || gridDimensions[0] - 1 < currentRowIndex || currentColIndex < 0 || gridDimensions[1] - 1 < currentColIndex) {
      return;
    }

    // Get the value stored in the current grid cell.
    const cellDesignation = pathfindingGrid[currentRowIndex][currentColIndex];

    // If the cell is an obstacle, we cannot traverse it.
    if ( cellDesignation === '#' ) {
      return;
    }
    // If the cell is an empty path ('.') or we've found a path with fewer warps.
    else if ( cellDesignation === '.' || cellDesignation > currentWarpCount ) {
      pathfindingGrid[currentRowIndex][currentColIndex] = currentWarpCount; // Update the cell with the new warp count.

      // Add adjacent cells for standard (non-warp) movement.
      processingQueue.push( [ [ currentRowIndex + 1, currentColIndex ], currentWarpCount ] );
      processingQueue.push( [ [ currentRowIndex - 1, currentColIndex ], currentWarpCount ] );
      processingQueue.push( [ [ currentRowIndex, currentColIndex + 1 ], currentWarpCount ] );
      processingQueue.push( [ [ currentRowIndex, currentColIndex - 1 ], currentWarpCount ] );

      // Add cells within a 5x5 area for warp movement (costing one additional warp).
      for ( let verticalOffset = -2; verticalOffset < 3; verticalOffset++ ) {
        for ( let horizontalOffset = -2; horizontalOffset < 3; horizontalOffset++ ) {
          processingQueue.push( [ [ currentRowIndex + verticalOffset, currentColIndex + horizontalOffset ], currentWarpCount + 1 ] );
        }
      }
    }
  };

  // Add the initial starting position to the processing queue with zero warps.
  // Adjusting coordinates from 1-based to 0-based indexing.
  processingQueue.push( [ [ startCoordinates[0] - 1, startCoordinates[1] - 1 ], 0 ] );

  // Continue processing elements from the queue until it becomes empty.
  while ( processingQueue.length !== 0 ) {
    const dequeuedElement = processingQueue.shift(); // Retrieve the next element.
    evaluateLocation( dequeuedElement[0], dequeuedElement[1] ); // Explore the cell.
  }

  // Determine the final result for the target cell.
  // If the target cell is still '.', it means it's unreachable, so return -1.
  // Otherwise, return the minimum warp count found.
  console.log(
    pathfindingGrid[ targetCoordinates[0] - 1 ][ targetCoordinates[1] - 1 ] !== '.'
      ? pathfindingGrid[ targetCoordinates[0] - 1 ][ targetCoordinates[1] - 1 ]
      : -1
  );
}

// Invoke the primary processing function with input read from standard input.
ProcessGridData( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );