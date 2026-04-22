console .log( ( inputDataString => {
  // Define a constant for the marker character for clarity.
  const SYMBOL_MARKER = '#';

  /*
   * Split the entire input string by newline characters.
   * The first line contains dimensions, the rest are grid rows.
   */
  const [ dimensionsLine, ...gridRows ] = inputDataString
                                         . trim()
                                         . split `\n`;

  // Parse the dimensions: height, width, and an unused 'K' value.
  const [ numRows, numCols, maxVal ] = dimensionsLine
                                       . split ` `
                                       . map( parsedSegment => parseInt(parsedSegment, 10) );

  // Initialize a 2D array (grid) with dimensions `numRows` x `numCols`, filled with zeros.
  const processedGrid = Array
                        . from( { length: numRows }, ( ignoredParam ) =>
                          new Array( numCols )
                             . fill( 0 )
                        );

  /**
   * Helper function to propagate a segment identifier.
   * If the cell already has a value, use it.
   * Otherwise, if a current ID is provided, assign it to the cell.
   * @param {number} rowIndex - The current row index.
   * @param {number} colIndex - The current column index.
   * @param {number} currentId - The ID to potentially propagate.
   * @returns {number} The value currently in the cell or the propagated ID.
   */
  const propagateValue = ( rowIndex, colIndex, currentId ) => {
    if ( processedGrid[rowIndex][colIndex] ) {
      return processedGrid[rowIndex][colIndex];
    } else if ( currentId ) {
      processedGrid[rowIndex][colIndex] = currentId;
      return currentId;
    }
    return currentId; // If currentId is 0 and cell is 0, return 0
  };

  // Global counter for unique segment identifiers.
  let globalIdCounter = 0;

  // First pass: Process rows from left to right, then right to left.
  for ( let rowIndex = 0; rowIndex < numRows; rowIndex++ ) {
    let segmentId = 0; // Local segment ID for the current row.

    // Iterate through columns from left to right.
    for ( let colIndex = 0; colIndex < numCols; colIndex++ ) {
      // If a marker is found, increment the global counter and assign it as the new segment ID.
      if ( gridRows[rowIndex][colIndex] === SYMBOL_MARKER ) {
        segmentId = ++globalIdCounter;
      }
      // Assign the current segment ID to the cell.
      processedGrid[rowIndex][colIndex] = segmentId;
    }

    // Iterate through columns from right to left to propagate IDs backwards in the row.
    for ( let colIndex = numCols - 1; colIndex >= 0; colIndex-- ) {
      segmentId = propagateValue( rowIndex, colIndex, segmentId );
    }
  }

  // Second pass: Process columns from top to bottom, then bottom to top.
  for ( let colIndex = 0; colIndex < numCols; colIndex++ ) {
    let segmentId = 0; // Local segment ID for the current column.

    // Iterate through rows from top to bottom.
    for ( let rowIndex = 0; rowIndex < numRows; rowIndex++ ) {
      segmentId = propagateValue( rowIndex, colIndex, segmentId );
    }

    // Iterate through rows from bottom to top to propagate IDs upwards in the column.
    for ( let rowIndex = numRows - 1; rowIndex >= 0; rowIndex-- ) {
      segmentId = propagateValue( rowIndex, colIndex, segmentId );
    }
  }

  // Format the resulting grid into a string, with space-separated values per row and newline-separated rows.
  return processedGrid
         . map( outputRow => outputRow.join ` ` )
         . join `\n`;

} )( require( 'fs' )
     . readFileSync( '/dev/stdin', 'utf8' )
) );