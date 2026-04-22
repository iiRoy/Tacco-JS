'use strict';
( function( rawData ) {
  // Process the input string: trim whitespace, split by spaces, and convert to numbers.
  let processedNumbers = rawData . trim() . split( /\s+/ ) . map( currentVal => Number( currentVal ) ) ;

  // Extract initial game parameters from the processed numbers.
  const countElements = processedNumbers . shift(); // Represents 'N' - count of allowed moves.
  const targetSum = processedNumbers . shift();     // Represents 'K' - the target sum for the game.
  const allowedMoves = processedNumbers;            // Represents 'A' - array of possible moves.

  // Initialize a dynamic programming table (gameStates) to store winning/losing states.
  // The size is targetSum + 2 to accommodate indices up to targetSum + 1.
  // States are initialized to null, meaning 'unknown'.
  const gameStates = new Array( targetSum + 2 ) . fill( null );

  // Base case: The state targetSum + 1 is always a winning state (or an unreachable state
  // that helps in backward calculation if interpreted as 'player cannot move').
  gameStates[ targetSum + 1 ] = true;

  // Iterate backward from targetSum + 1 down to the smallest possible move.
  // This simulates the game from the end state to the start.
  for ( let currentPosition = targetSum + 1; currentPosition >= allowedMoves[ 0 ]; currentPosition-- ) {
    // If the current position is a winning state for the current player (determined by previous calculations).
    if ( gameStates[ currentPosition ] ) {
      // If subtracting the smallest move from the current position leads to a winning state,
      // it means the current player can force a win by making that specific move.
      // However, if the opponent can also force a win from currentPosition - 1,
      // this loop segment handles a specific condition for the first player.
      if ( gameStates[ currentPosition - 1 ] === true ) {
        // This 'continue' statement skips setting states if the immediate prior state is already a win.
        continue;
      }

      // If the immediate prior state is not a forced win, consider all moves from 1 up to the smallest allowed move.
      for ( let moveOption = 1; moveOption <= allowedMoves[ 0 ]; moveOption++ ) {
        // Ensure the new position is valid (non-negative).
        if ( currentPosition - moveOption >= 0 ) {
          // If the state for (currentPosition - moveOption) is still unknown, mark it as a losing state.
          // This happens if the current position is a winning state, meaning the player
          // who moves *to* currentPosition - moveOption will lose.
          if ( gameStates[ currentPosition - moveOption ] === null ) {
            gameStates[ currentPosition - moveOption ] = false;
          }
        }
      }
    }

    // If the current position is a losing state for the current player.
    if ( !gameStates[ currentPosition ] ) {
      // From a losing position, the current player tries to make a move
      // that forces the *next* player into a winning position.
      // This means the current player is trying to make a move to a state
      // that was previously determined to be a losing state for the player
      // who lands there.
      for ( let idx = 0; idx < countElements; idx++ ) {
        // Check if the move is valid (does not go below 0).
        if ( currentPosition - allowedMoves[ idx ] >= 0 ) {
          // If a move leads to a valid state, mark that state as a winning state
          // for the player who makes the move *to* that state.
          gameStates[ currentPosition - allowedMoves[ idx ] ] = true;
        }
      }
    }
  }

  // Determine the winner based on the state of gameStates[0] (the starting position).
  if ( gameStates[ 0 ] === true ) {
    console.log( 'First' ); // If gameStates[0] is true, the first player wins.
  } else {
    console.log( 'Second' ); // Otherwise, the second player wins.
  }
} ) ( require( 'fs' ) . readFileSync( '/dev/stdin', 'utf8' ) );