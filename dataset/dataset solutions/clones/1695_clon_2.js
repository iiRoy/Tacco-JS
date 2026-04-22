'use strict'; // Strict mode enforcement

// This function processes the raw input data to solve a grid-based problem.
function ProcessInput ( rawInputData ) {
  const parsedLines = rawInputData . trim ( ) . split ( / \r? \n / g ) ;

  // Extract dimensions (height, width) and target count from the first line.
  const [ numRows, numCols, targetCount ] = parsedLines . shift ( ) . split ( ' ' ) . map ( Number ) ;

  // The remaining lines represent the grid content.
  const gridContent = parsedLines ;

  let finalTally = 0 ; // Initialize counter for valid configurations.

  // Iterate through all possible row combinations to exclude.
  for ( let rowBitmask = 0 ; rowBitmask < ( 1 << numRows ) ; rowBitmask ++ ) {
    // Iterate through all possible column combinations to exclude.
    for ( let colBitmask = 0 ; colBitmask < ( 1 << numCols ) ; colBitmask ++ ) {
      let currentBlackCount = 0 ; // Count of '#' characters in the current configuration.

      // Traverse the grid based on the current row and column masks.
      for ( let rowIndex = 0 ; rowIndex < numRows ; rowIndex ++ ) {
        // If this row is marked for exclusion by the bitmask, skip it.
        if ( ( rowBitmask >> rowIndex ) & 1 ) {
          continue ;
        }
        for ( let colIndex = 0 ; colIndex < numCols ; colIndex ++ ) {
          // If this column is marked for exclusion by the bitmask, skip it.
          if ( ( colBitmask >> colIndex ) & 1 ) {
            continue ;
          }
          // If the cell contains a black piece ('#'), increment the count.
          if ( gridContent [ rowIndex ] [ colIndex ] === "#" ) {
            currentBlackCount ++ ;
          }
        }
      }
      // If the count of black pieces matches the target, increment the final tally.
      if ( currentBlackCount === targetCount ) {
        finalTally ++ ;
      }
    }
  }
  // Output the total number of valid configurations to the console.
  console . log ( finalTally ) ;
}

// Invoke the main processing logic using data read from standard input.
ProcessInput ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;