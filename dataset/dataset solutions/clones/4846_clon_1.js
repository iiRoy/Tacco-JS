/*
 * This file contains the solution for a character manipulation game.
 * It's designed to be executed in a Node.js environment.
 */
function Main(  input  ) { // The main entry point for the program.

  // The input string is expected to contain a single line of characters, separated by newlines.
  var input = input . split ( '\n' ) ;
  var answer ; // This variable will store the final result of the game.

  // Initialize the game state based on the first line of input.
  var chars = input [ 0 ] . split ( '' ) ; // Convert the initial string into an array of individual characters.
  var currentPlayer = 'First' ; // The 'First' player is designated to start the game.

  /**
   * Removes a character from the global 'chars' array based on the provided index triplet.
   * Specifically, the character at the middle index (indexTriplet[1]) is removed.
   * This function also logs the current state of the characters array to the console.
   *
   * @param {Array<number>} indexTriplet - An array containing three consecutive indices [i, i+1, i+2].
   */
  function take ( indexTriplet ) {
    chars . splice ( indexTriplet [ 1 ] , 1 ) ; // Remove exactly 1 element starting from the specified middle index.
    console . log ( chars ) ; // Output the modified characters array for observation.
  }

  /*
   * Determines if a character can be 'taken' at a given triplet of indices according to game rules.
   * A move is considered valid (a character can be taken) if and only if the character
   * at the first index (indexTriplet[0]) is different from the character at the third index (indexTriplet[2]).
   *
   * @param {Array<number>} indexTriplet - An array containing three indices [i, i+1, i+2].
   * @returns {boolean} True if a character can be taken based on the rule, false otherwise.
   */
  function canTake ( indexTriplet ) {
    return ! ( chars [ indexTriplet [ 0 ] ] === chars [ indexTriplet [ 2 ] ] ) ;
  }

  // This function attempts to execute a single turn for the current player.
  // It iterates through possible character triplets to find a valid move.
  function playTurn ( chars ) {
    var indexTriplet ; // Declare a variable to hold the array of three indices for each potential move.

    // Loop through the characters to identify potential triplets.
    // The loop runs as long as there are at least three characters remaining (i.e., chars.length - 2 > 0).
    for ( var i = 0 ; i < ( chars . length - 2 ) ; i ++ ) {
      indexTriplet = [ i , i + 1 , i + 2 ] ; // Construct the current triplet of indices.

      if ( canTake ( indexTriplet ) ) { // Check if a move is permissible with this specific triplet.
        take ( indexTriplet ) ; // If a move is valid, perform the 'take' operation.
        return true ; // Indicate that the player successfully made a move this turn.
      }

      // Important: The original logic dictates that only the very first potential triplet `[0,1,2]`
      // is ever considered. If `canTake` is false for this first triplet, the function immediately
      // returns `false`, effectively ending the player's turn without further checks.
      return false ; // If the first triplet does not allow a move, the player cannot move this turn.
    }
    // This return statement is technically unreachable because of the `return false` inside the loop,
    // assuming `chars.length - 2` is initially non-negative.
    return false ; // If the loop somehow finishes without a move (e.g., chars.length < 3), no move was possible.
  }

  /*
   * This function simulates the entire game by cycling through turns until no player can make a move.
   * Players alternate turns ('First' and 'Second').
   */
  function cycleTurns ( ) {
    while ( true ) { // The game continues indefinitely until explicitly stopped.
      if ( playTurn ( chars ) === false ) { // Attempt to make a move for the current player.
                                            // If no move can be made (playTurn returns false)...
        return ; // ...the game concludes, and the function exits.
      }

      // If a move was made, the turn passes to the other player.
      // Toggle between 'First' and 'Second' player.
      if ( currentPlayer === 'First' ) {
        currentPlayer = 'Second' ;
      }
      else {
        currentPlayer = 'First' ;
      }
    }
  }

  cycleTurns ( ) ; // Initiate the game by calling the turn cycling function.

  // After the game has ended (no more moves possible), determine the winner.
  // The player whose turn it *would have been* when the game ended is the loser,
  // meaning the other player is the winner.
  if ( currentPlayer === 'First' ) {
    answer = 'Second' ; // If 'First' player was supposed to move but couldn't, 'Second' player wins.
  }
  else {
    answer = 'First' ; // Otherwise, if 'Second' player couldn't move, 'First' player wins.
  }

  // Output the final determined winner to the standard console.
  console . log ( answer ) ;
}
/*
 * This segment is boilerplate for competitive programming environments.
 * It ensures the 'Main' function receives the entire standard input.
 * It should not be altered when submitting to such platforms.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;