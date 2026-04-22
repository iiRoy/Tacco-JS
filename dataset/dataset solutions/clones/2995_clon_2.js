'use strict';

/**
 * Main entry point for processing the game input.
 * This function simulates movement within a grid based on player actions and restrictions.
 * @param {string} rawData - The raw input string containing grid dimensions,
 *                           start position, number of steps, and move/restriction sequences.
 */
function ProcessInput ( rawData ) {
  // Split the raw input string into an array of tokens using whitespace as delimiter.
  const tokenizedData = rawData.split ( /\s+/ );

  // Parse grid dimensions and game parameters from the tokenized data.
  // Using `Number()` for explicit type conversion.
  const gridHeight = Number ( tokenizedData.shift ( ) ); // Represents the height of the playable grid area.
  const gridWidth = Number ( tokenizedData.shift ( ) );  // Represents the width of the playable grid area.
  const numSteps = Number ( tokenizedData.shift ( ) );  // Total number of simulation steps to perform.

  const startRow = Number ( tokenizedData.shift ( ) );  // Initial row coordinate (1-indexed).
  const startCol = Number ( tokenizedData.shift ( ) );  // Initial column coordinate (1-indexed).

  const moveSequence = tokenizedData.shift ( );   // Sequence of player movement commands (e.g., 'U', 'D', 'L', 'R').
  const restrictSequence = tokenizedData.shift ( ); // Sequence of restriction commands, applied after player moves.

  // Initialize a data structure to track the possible boundaries of the player's position.
  // Each inner array stores [min_col, max_col, min_row, max_row] for a given step.
  // We start with the initial position as both min and max for all boundaries.
  const positionBounds = [ [ startCol, startCol, startRow, startRow ] ];

  // Iterate through each step of the simulation.
  for ( let stepIndex = 0; stepIndex < numSteps; stepIndex++ ) {
    // Create a new entry for the current step's boundaries.
    positionBounds[ stepIndex + 1 ] = [ ];

    // Calculate potential new boundaries based on the player's move for the current step.
    // Index 0: min_col, Index 1: max_col, Index 2: min_row, Index 3: max_row
    // 'L' decrements column, 'R' increments column.
    positionBounds[ stepIndex + 1 ][ 0 ] = positionBounds[ stepIndex ][ 0 ] - ( moveSequence[ stepIndex ] === 'L' ? 1 : 0 );
    positionBounds[ stepIndex + 1 ][ 1 ] = positionBounds[ stepIndex ][ 1 ] + ( moveSequence[ stepIndex ] === 'R' ? 1 : 0 );
    // 'U' decrements row, 'D' increments row.
    positionBounds[ stepIndex + 1 ][ 2 ] = positionBounds[ stepIndex ][ 2 ] - ( moveSequence[ stepIndex ] === 'U' ? 1 : 0 );
    positionBounds[ stepIndex + 1 ][ 3 ] = positionBounds[ stepIndex ][ 3 ] + ( moveSequence[ stepIndex ] === 'D' ? 1 : 0 );

    // Check if any boundary has moved out of the valid grid range (1 to H/W).
    // If min_col becomes 0, or max_col becomes W+1, or min_row becomes 0, or max_row becomes H+1,
    // it means the player *must* have gone out of bounds, so no solution.
    if ( positionBounds[ stepIndex + 1 ][ 0 ] === 0
      || positionBounds[ stepIndex + 1 ][ 1 ] === gridWidth + 1
      || positionBounds[ stepIndex + 1 ][ 2 ] === 0
      || positionBounds[ stepIndex + 1 ][ 3 ] === gridHeight + 1 )
    {
      console.log ( 'NO' ); // Output 'NO' if impossible.
      return;                 // Terminate execution.
    }

    // Now, apply the restrictions from the 'restrictSequence'.
    // Restrictions can expand the possible range if the player is pushed back.
    // For min_col: if 'R' restriction, min_col can increase (pushed right). Cap at gridWidth.
    positionBounds[ stepIndex + 1 ][ 0 ] = Math.min (
      positionBounds[ stepIndex + 1 ][ 0 ] + ( restrictSequence[ stepIndex ] === 'R' ? 1 : 0 ),
      gridWidth
    );
    // For max_col: if 'L' restriction, max_col can decrease (pushed left). Cap at 1.
    positionBounds[ stepIndex + 1 ][ 1 ] = Math.max (
      positionBounds[ stepIndex + 1 ][ 1 ] - ( restrictSequence[ stepIndex ] === 'L' ? 1 : 0 ),
      1
    );
    // For min_row: if 'D' restriction, min_row can increase (pushed down). Cap at gridHeight.
    positionBounds[ stepIndex + 1 ][ 2 ] = Math.min (
      positionBounds[ stepIndex + 1 ][ 2 ] + ( restrictSequence[ stepIndex ] === 'D' ? 1 : 0 ),
      gridHeight
    );
    // For max_row: if 'U' restriction, max_row can decrease (pushed up). Cap at 1.
    positionBounds[ stepIndex + 1 ][ 3 ] = Math.max (
      positionBounds[ stepIndex + 1 ][ 3 ] - ( restrictSequence[ stepIndex ] === 'U' ? 1 : 0 ),
      1
    );
  }

  // If the loop completes without returning, it means a valid path exists.
  console.log ( 'YES' );
}

// Call the processing function with input read from standard input.
ProcessInput ( require ( 'fs' ).readFileSync ( '/dev/stdin', 'utf8' ) );