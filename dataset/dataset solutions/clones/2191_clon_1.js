/*
 * This is a JavaScript file demonstrating a simple game logic.
 * It processes input to determine if a player can survive a series of attacks.
 */

"use strict" // Enforces strict mode for cleaner code and fewer errors.

/**
 * The main function that processes game logic based on provided input.
 *
 * @param {string} arg - The input string containing game parameters.
 *                       Expected format:
 *                       "health numberOfMoves\nattack1 attack2 ... attackN"
 */
function main ( arg ) {

  // --- Input Parsing Section ---

  // Trim leading/trailing whitespace and split the input string into lines.
  const input = arg . trim ( ) . split ( "\n" ) ;

  // Parse initial health and the maximum number of moves allowed.
  // The first line contains "health numberOfMoves".
  let health = parseInt ( input [ 0 ] . split ( " " ) [ 0 ] ) ; // Player's current health.
  const numberOfMoves = parseInt ( input [ 0 ] . split ( " " ) [ 1 ] ) ; // Maximum allowed moves/attacks.

  // Parse the attack values from the second line.
  // These are space-separated numbers.
  const attacts = input [ 1 ] . split ( " " ) . map ( n => parseInt ( n ) ) ;

  // --- Game Simulation Section ---

  let count = 0 ; // Counter for the number of moves made.
  let i = 0 ; // Index for iterating through the 'attacts' array.

  // Loop as long as the player's health is non-negative.
  while ( health >= 0 ) {

    count ++ ; // Increment the move counter for each attack.

    // If all attacks have been used, reset the attack index to loop attacks.
    if ( i >= attacts . length ) {
      i = 0 ; // Reset to the first attack.
    }

    // Deduct the current attack's damage from health.
    health = health - attacts [ i ] ;

    // Move to the next attack in the sequence.
    i ++ ;
  }

  // --- Result Output Section ---

  // Check if the player survived within the allowed number of moves.
  if ( count <= numberOfMoves ) {
    console . log ( "yes" ) ; // Player survived.
  } else {
    console . log ( "no" ) ; // Player did not survive or took too many moves.
  }

} // End of main function.

/*
 * This section handles reading input from standard input
 * and calling the main function with that input.
 * It's typical for competitive programming environments.
 */
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;