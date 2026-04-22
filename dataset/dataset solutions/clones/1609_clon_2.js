function ProcessInput( rawInputData ) {
  // Normalize the incoming data: remove leading/trailing whitespace and split into individual lines.
  const processedLines = rawInputData.trim().split( "\n" );

  // Parse the first line to extract grid dimensions and the count of special items.
  const [totalRows, totalCols, numItems] = processedLines.shift().split( " " ) .map( ( lineSegment ) => Number.parseInt( lineSegment, 10 ) );

  // Process the subsequent lines, converting each into an array of numeric item details.
  const itemDetails = processedLines.map( ( dataRow ) =>
    dataRow.split( " " ).map( ( numericSegment ) => Number.parseInt( numericSegment, 10 ) )
  );

  let rCoord, cCoord, statePhase; // Declare iterators for the grid and state dimensions.
  let cellContents = []; // This array will store values for specific cells, indexed by (row, col).
  let dynamicMemo = []; // This 2D array serves as the dynamic programming table for state calculations.

  // Populate the 'cellContents' grid using the provided item data.
  // Input coordinates are 1-indexed, so we convert them to 0-indexed for array access.
  for ( let currentIdx = 0; currentIdx < numItems; currentIdx++ ) {
    const [itemRowCoord, itemColCoord, itemValueAmount] = itemDetails[currentIdx];
    cellContents[itemRowCoord - 1] = cellContents[itemRowCoord - 1] || [];
    cellContents[itemRowCoord - 1][itemColCoord - 1] = itemValueAmount;
  }

  // Begin the core dynamic programming iteration over the grid cells.
  for ( rCoord = 0; rCoord < totalRows; rCoord++ ) {
    dynamicMemo[rCoord] = dynamicMemo[rCoord] || [];
    dynamicMemo[rCoord + 1] = dynamicMemo[rCoord + 1] || []; // Ensure the next row exists for potential future initialization/aliasing.
    for ( cCoord = 0; cCoord < totalCols; cCoord++ ) {
      // Initialize the current cell's state array if it hasn't been set yet.
      dynamicMemo[rCoord][cCoord] = dynamicMemo[rCoord][cCoord] || [0, 0, 0, 0];
      // Initialize the state array for the cell to the right in the current row.
      dynamicMemo[rCoord][cCoord + 1] = dynamicMemo[rCoord][cCoord + 1] || [0, 0, 0, 0];
      // IMPORTANT: The cell directly below the current cell is made to reference the current cell's state array.
      // This means modifications to dynamicMemo[rCoord][cCoord] will also affect dynamicMemo[rCoord + 1][cCoord].
      dynamicMemo[rCoord + 1][cCoord] = dynamicMemo[rCoord][cCoord];

      // Iterate through the state phases for the current cell to update values based on item presence.
      for ( statePhase = 2; statePhase >= 0; statePhase-- ) {
        const currentValue = (cellContents[rCoord] && cellContents[rCoord][cCoord]) || 0;
        dynamicMemo[rCoord][cCoord][statePhase + 1] = Math.max(
          dynamicMemo[rCoord][cCoord][statePhase + 1],
          dynamicMemo[rCoord][cCoord][statePhase] + currentValue
        );
      }

      // Propagate maximum values from the current cell's states to adjacent cells (down and right).
      // Due to the aliasing, the update to dynamicMemo[rCoord + 1][cCoord][0] also updates dynamicMemo[rCoord][cCoord][0].
      for ( statePhase = 0; statePhase < 4; statePhase++ ) {
        dynamicMemo[rCoord + 1][cCoord][0] = Math.max(
          dynamicMemo[rCoord + 1][cCoord][0],
          dynamicMemo[rCoord][cCoord][statePhase]
        );
        dynamicMemo[rCoord][cCoord + 1][statePhase] = Math.max(
          dynamicMemo[rCoord][cCoord + 1][statePhase],
          dynamicMemo[rCoord][cCoord][statePhase]
        );
      }
    }
  }

  let calculatedMax = 0; // Initialize a variable to store the final maximum result.
  // After all iterations, find the maximum value among all states in the bottom-rightmost cell.
  for ( statePhase = 0; statePhase < 4; statePhase++ ) {
    calculatedMax = Math.max( calculatedMax, dynamicMemo[totalRows - 1][totalCols - 1][statePhase] );
  }
  // Output the final computed maximum value to the console.
  console.log( calculatedMax );
}

// Read the input data from standard input (typically a file in competitive programming environments)
// and then pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));