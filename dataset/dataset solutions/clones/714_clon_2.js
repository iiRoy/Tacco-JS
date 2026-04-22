#!/usr/bin/node

// Encapsulates the entire application logic within an Immediately Invoked Function Expression (IIFE)
( function ( ) {

  // A 2D array (matrix) used to store the current map or grid data for processing.
  // Each element will be a number (0 or 1) representing cell state.
  let gridMatrix = [ ] ;

  // An array to buffer all incoming processed lines from standard input.
  // Each entry here will be an array of numbers representing a row in the grid.
  let lineDataStore = [ ] ;

  // Obtain a reference to the standard input stream object for reading data.
  const inputSource = process.openStdin( ) ;

  // Configure the input stream to interpret incoming bytes as UTF-8 encoded characters.
  inputSource.setEncoding( 'utf8' ) ;

  /**
   * Recursively explores and processes connected regions within the `gridMatrix`.
   * It effectively performs a flood-fill operation, marking visited cells.
   *
   * @param { number } columnPos - The column index (x-coordinate) of the current cell.
   * @param { number } rowPos    - The row index (y-coordinate) of the current cell.
   */
  const processComponent = function ( columnPos , rowPos ) {
    // Check if the current coordinates are within the grid boundaries
    // AND if the cell at these coordinates is considered "active" (truthy, e.g., 1).
    if (   0 <= columnPos && columnPos < gridMatrix[ 0 ].length
        && 0 <= rowPos    && rowPos    < gridMatrix.length
        && gridMatrix[ rowPos ][ columnPos ]
    ) {
      // If the cell is active and within bounds, mark it as visited by setting its value to 0.
      gridMatrix[ rowPos ][ columnPos ] = 0 ;

      // Recursively invoke this function for all eight adjacent cells (cardinal and diagonal directions).
      // This ensures all connected active cells are visited and marked.

      // Explore directly adjacent cells (up, down, left, right):
      processComponent( columnPos - 1 , rowPos     ) ;
      processComponent( columnPos + 1 , rowPos     ) ;
      processComponent( columnPos     , rowPos - 1 ) ;
      processComponent( columnPos     , rowPos + 1 ) ;

      // Explore diagonally adjacent cells:
      processComponent( columnPos - 1 , rowPos - 1 ) ;
      processComponent( columnPos + 1 , rowPos - 1 ) ;
      processComponent( columnPos - 1 , rowPos + 1 ) ;
      processComponent( columnPos + 1 , rowPos + 1 ) ;
    }
  } ;

  // A temporary string buffer to store partial lines that might come in fragmented data chunks.
  let pendingInput = "" ;

  // Attach an event listener to the standard input stream to handle incoming data.
  inputSource.on( 'data' , function ( dataChunk ) {
    // Concatenate any previously pending input fragment with the new data chunk.
    // Then, split the combined string by newline characters to get individual lines.
    const processedParts = ( pendingInput + dataChunk ).split( "\n" ) ;

    // The last element of `processedParts` might be an incomplete line.
    // Remove it from the array and store it back into `pendingInput` for the next chunk.
    pendingInput = processedParts.pop( ) ;

    // Iterate through each complete line obtained from the split operation.
    for ( let outerIdx = 0 ; outerIdx < processedParts.length ; outerIdx++ ) {
      // If a line is empty (e.g., due to multiple consecutive newlines), skip it.
      if ( processedParts[ outerIdx ] === '' ) continue ;

      // Convert the string line into an array of numbers (e.g., "101" becomes [1, 0, 1]).
      // Each character is parsed as an integer.
      lineDataStore.push( processedParts[ outerIdx ].split( '' ).map( val => parseInt( val , 10 ) ) ) ;
    }
  } ) ;

  // Attach an event listener to the standard input stream to handle its 'end' event.
  inputSource.on( 'end' , function ( terminationSignal ) {
    // Declare local variables for loop iteration and counting connected components.
    let outerIdx , innerIdx , componentCounter ;

    // Start an infinite loop to process multiple grid configurations, breaking when no more input.
    for ( ; ; ) {
      // Reset the component counter for each new grid analysis.
      componentCounter = 0 ;

      // Extract the 'segment size' (height) from the second element of the first line in `lineDataStore`.
      // The first line itself is consumed and removed from `lineDataStore`.
      const segmentSize = ( lineDataStore.shift( ) )[ 1 ] ;

      // If `segmentSize` evaluates to falsy (e.g., undefined if `lineDataStore` is empty, or 0),
      // it signifies the end of valid input segments, so terminate the loop.
      if ( !segmentSize ) break ;

      // Populate `gridMatrix` with the next `segmentSize` lines from `lineDataStore`.
      // These lines represent the current grid to be processed.
      gridMatrix = lineDataStore.slice( 0 , segmentSize ) ;

      // Iterate through each column of the grid.
      for ( outerIdx = 0 ; outerIdx < gridMatrix[ 0 ].length ; outerIdx++ ) {
        // Iterate through each row of the grid.
        for ( innerIdx = 0 ; innerIdx < gridMatrix.length ; innerIdx++ ) {
          // If the cell at the current (innerIdx, outerIdx) position is 'active' (truthy, e.g., 1),
          // increment the component counter and initiate the recursive `processComponent` function.
          if ( gridMatrix[ innerIdx ][ outerIdx ] ) {
            componentCounter++ ;
            processComponent( outerIdx , innerIdx ) ; // Begin flood-fill from this active cell.
          }
        }
      }
      // Output the total number of distinct connected components found for the current grid.
      console.log( componentCounter ) ;

      // Remove the `segmentSize` lines that have just been processed from `lineDataStore`,
      // preparing it for the next potential grid configuration.
      lineDataStore = lineDataStore.slice( segmentSize ) ;
    }
  } ) ;

} ).call( this ) ; // Execute the IIFE, binding 'this' to the global context.