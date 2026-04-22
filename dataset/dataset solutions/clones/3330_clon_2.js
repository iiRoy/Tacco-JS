'use strict';
( function ( rawInputData ) {

    // Process the incoming raw string data:
    // 1. Remove leading/trailing whitespace.
    // 2. Split the string into an array of substrings using one or more whitespace characters as delimiters.
    // 3. Convert each substring (which represents a number) into an actual number.
    let processedNumbers = rawInputData . trim ( ) . split ( / \s + / ) . map ( numStr => Number ( numStr ) ) ;
    
    // Extract the first two essential game parameters from the processed number array.
    const countOfMoves = processedNumbers . shift ( ) ; // This corresponds to 'N' in the original problem context.
    const targetValue = processedNumbers . shift ( ) ;   // This corresponds to 'K' in the original problem context.
    
    // The remaining numbers in the array are the available sizes for moves.
    const availableMoves = processedNumbers ; // This corresponds to 'A' in the original problem context.
    
    // Initialize a dynamic programming array to store game state outcomes.
    // The array size is 'targetValue + 2' to handle boundary conditions up to K+1.
    // All states are initially set to 'undefined', indicating they are uncalculated.
    const gameStates = new Array ( targetValue + 2 ) . fill ( undefined ) ;
    
    // Establish a base case for the dynamic programming calculation:
    // The state immediately beyond the target value is considered a winning state for the player who just moved there.
    gameStates [ targetValue + 1 ] = true ;
    
    // Iterate backwards from the state beyond the target value down to zero.
    // This bottom-up approach determines the outcome of each game position.
    for ( let currentPosition = targetValue + 1 ; currentPosition >= 0 ; currentPosition -- ) {
        
        // If the current game position is determined to be a winning state for the current player.
        if ( gameStates [ currentPosition ] ) {
            // Check for a specific game rule or optimization:
            // If the current position is a winning state AND the immediately preceding position is also a winning state.
            if ( gameStates [ currentPosition - 1 ] === true ) {
                currentPosition -- ; // Decrement currentPosition to effectively skip the next iteration's check of (currentPosition-1).
                continue ;           // Skip the rest of the current loop iteration and move to the next 'currentPosition'.
            }
            
            // If the current position is a winning state (and the above special condition wasn't met),
            // then consider moves using the first available move size (availableMoves[0]).
            // Any state from which a player can reach this 'winning' state via 'availableMoves[0]'
            // might be a losing state for the player moving from it, if not yet determined.
            for ( let stepSize = 1 ; stepSize <= availableMoves [ 0 ] ; stepSize ++ ) {
                if ( currentPosition - stepSize >= 0 ) { // Ensure the calculated previous position is within valid bounds.
                    if ( gameStates [ currentPosition - stepSize ] === undefined ) { // If this previous state is uncalculated.
                        gameStates [ currentPosition - stepSize ] = false ; // Mark it as a losing state.
                    }
                }
            }
        }
        
        // If the current game position is determined to be a losing state for the current player.
        // (This block executes if 'gameStates[currentPosition]' is false or was never set to true).
        if ( ! gameStates [ currentPosition ] ) {
            // From a losing state, any state that can reach this 'losing' state by making any of the 'availableMoves'
            // becomes a winning state for the player making that move.
            for ( let moveIndex = 0 ; moveIndex < countOfMoves ; moveIndex ++ ) {
                if ( currentPosition - availableMoves [ moveIndex ] >= 0 ) { // Ensure the calculated previous position is valid.
                    gameStates [ currentPosition - availableMoves [ moveIndex ] ] = true ; // Mark it as a winning state.
                }
            }
        }
    }
    
    // After iterating through all possible positions, the outcome for the starting position (0)
    // determines which player wins the game.
    if ( gameStates [ 0 ] ) {
        console . log ( 'First' ) ; // If state 0 is true, the first player to move wins.
    }
    else {
        console . log ( 'Second' ) ; // Otherwise, the second player wins.
    }

} ) ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;