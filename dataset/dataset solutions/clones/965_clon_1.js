/*
 * This file implements a solution for a sliding puzzle problem
 * using an Iterative Deepening Depth-First Search (IDDFS) algorithm.
 * The puzzle state is represented as a string.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 */

// Configuration object for input/output settings.
// config = { input: 'tmp', newline: '\r\n' } ; // Windows-specific input path and newline
 config= { input: '/dev/stdin', newline: '\n' } ; // Linux-specific input path and newline

// Require the 'assert' module, though not directly used in the provided snippet.
const assert=require( 'assert' ) ;

// Define the size of the puzzle grid. For a 4x4 puzzle, it's 16 tiles.
const SIZE = 16 ;

// The target state of the puzzle. '0' represents the empty tile.
goal = '123456789ABCDEF0' ;

// Initialize the puzzle board from standard input.
init = require( 'fs' ) .readFileSync( config.input , 'ascii' ) // Read input file as ASCII.
  .trim( ) // Remove leading/trailing whitespace.
  .split( config.newline ) // Split into lines based on the configured newline character.
  .map( function ( line ) { // Process each line.
    return line.split( ' ' ) // Split the line by spaces to get individual numbers.
               .map( function ( num ) { // Convert each number.
                 return Number( num ) .toString( 16 ) ; // Convert to a base-16 (hexadecimal) string.
               } ) .join( '' ) ; // Join hexadecimal numbers back into a single string for the row.
  } )
  .join( '' ) // Join all processed lines into one continuous string representing the board.
  .toUpperCase( ) ; // Convert the final board string to uppercase for consistency.

// Arrays defining valid moves for the empty tile (0) in each direction.
// Each index corresponds to a tile position (0-15).
// 'null' indicates an invalid move from that position.

north = [ null, null, null, null,  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11 ] ; // Moving '0' north

south = [  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15, null, null, null, null ] ; // Moving '0' south

west = [ null,  0,  1,  2, null,  4,  5,  6, null,  8,  9, 10, null, 12, 13, 14 ] ; // Moving '0' west

east = [  1,  2,  3, null,  5,  6,  7, null,  9, 10, 11, null, 13, 14, 15, null ] ; // Moving '0' east


/**
 * Implements the Iterative Deepening Depth-First Search (IDDFS) algorithm.
 * Searches for a path to the goal state within a given maximum depth (step).
 *
 * @param {number} step The current maximum depth limit for the search.
 * @param {string} board The current state of the puzzle board.
 * @returns {boolean} True if the goal state is found within the 'step' limit, false otherwise.
 */
function iddfs ( step , board ) {
  var idx0 , i , next ; // Declare variables for empty tile index, iterator, and next board state.

  // Base case: If the depth limit is reached.
  if ( step === 0 ) {
    return board === goal ; // Check if the current board is the goal.
  }

  // Find the index of the empty tile ('0').
  idx0 = board.indexOf( '0' ) ;

  // Attempt to move the empty tile north.
  i = north[ idx0 ] ;
  if ( i !== null ) {
    // Simulate the move by swapping the empty tile with the tile to its north.
    // This is done using a series of replace operations to avoid direct string manipulation by index.
    next = board.replace( board[ i ] , 'x' ) // Temporarily replace the target tile with 'x'.
                 .replace( '0' , 'y' ) // Temporarily replace '0' with 'y'.
                 .replace( 'x' , '0' ) // Replace 'x' (original target tile) with '0'.
                 .replace( 'y' , board[ i ] ) ; // Replace 'y' (original '0') with the target tile.

    // Recursively call iddfs with reduced step and the new board state.
    if ( iddfs( step - 1 , next ) )
      return true ; // If a solution is found in this path, propagate true.
  }

  // Attempt to move the empty tile south.
  i = south[ idx0 ] ;
  if ( i !== null ) {
    next = board.replace( board[ i ] , 'x' )
                .replace( '0' , 'y' )
                .replace( 'x' , '0' )
                .replace( 'y' , board[ i ] ) ;
    if ( iddfs( step - 1 , next ) )
      return true ;
  }

  // Attempt to move the empty tile west.
  i = west[ idx0 ] ;
  if ( i !== null ) {
    next = board.replace( board[ i ] , 'x' )
                .replace( '0' , 'y' )
                .replace( 'x' , '0' )
                .replace( 'y' , board[ i ] ) ;
    if ( iddfs( step - 1 , next ) )
      return true ;
  }

  // Attempt to move the empty tile east.
  i = east[ idx0 ] ;
  if ( i !== null ) {
    next = board.replace( board[ i ] , 'x' )
                .replace( '0' , 'y' )
                .replace( 'x' , '0' )
                .replace( 'y' , board[ i ] ) ;
    if ( iddfs( step - 1 , next ) )
      return true ;
  }

  // If no solution is found through any of the moves at the current step, return false.
  return false ;
}

// Main loop for Iterative Deepening.
// 'i' will store the minimum number of steps to reach the goal.
for ( i = 0 ; i <= 45 ; i ++ ) { // Iterate through increasing depth limits, typically up to a reasonable max.
  // Call IDDFS for the current depth limit.
  if ( iddfs( i , init ) )
    break ; // If a solution is found, break the loop.
}

// Output the minimum number of steps required to solve the puzzle.
console.log( i ) ;