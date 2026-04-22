// This is a Type I clone of the original JavaScript code.
// No logical or structural changes have been made.
// Only whitespace and comments are altered extensively.

"use strict" ; // Enforce strict mode for cleaner, more predictable code execution.

const main =  arg =>  {
  // The main function receives the raw input string.

  // First, process the input argument:
  // Trim any leading/trailing whitespace, then split into an array of lines.
  arg = arg .trim() .split( "\n" ) ;

  // Initialize arrays A, B, and C with characters from the respective input lines.
  const A = arg[ 0 ] .split( "" ) ; // Characters for player A.
  const B = arg[ 1 ] .split( "" ) ; // Characters for player B.
  const C = arg[ 2 ] .split( "" ) ; // Characters for player C.

  let next = "a" ; // Variable to track whose turn it is, starting with 'a'.

  // Begin the main game loop. This loop will run indefinitely
  // until a player's character array is exhausted, leading to a 'return'.
  while ( true ) {
    // Check the current player indicated by the 'next' variable.
    if ( next  ===  "a" ) {
      // If it's player A's turn:
      // Check if player A has run out of characters.
      if ( A .length  ===  0 ) {
        console .log( "A" ) ; // If A's array is empty, player A wins.
        return ; // Exit the function as the game has concluded.
      }

      // If A still has characters, take the first character
      // from A's array and set it as the next player's turn.
      next = A .shift() ; // 'shift()' removes and returns the first element.
    }
    else if ( next  ===  "b" ) {
      // If it's player B's turn:
      // Check if player B has run out of characters.
      if ( B .length  ===  0 ) {
        console .log( "B" ) ; // If B's array is empty, player B wins.
        return ; // Exit the function.
      }

      // If B still has characters, take the first character
      // from B's array and set it as the next player's turn.
      next = B .shift() ;
    }
    else if ( next  ===  "c" ) {
      // If it's player C's turn:
      // Check if player C has run out of characters.
      if ( C .length  ===  0 ) {
        console .log( "C" ) ; // If C's array is empty, player C wins.
        return ; // Exit the function.
      }

      // If C still has characters, take the first character
      // from C's array and set it as the next player's turn.
      next = C .shift() ;
    }
  } // End of the while (true) game loop.
} // End of the main function definition.

// This line executes the 'main' function.
// It reads the entire content of '/dev/stdin' as a UTF-8 string
// using Node.js's 'fs' module and passes it as the 'arg' to 'main'.
main( require( 'fs' ) .readFileSync( '/dev/stdin', 'utf8' ) ) ;