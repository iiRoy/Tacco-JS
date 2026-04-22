/*
 * This script processes player scores from standard input.
 * It reads player actions and updates their scores,
 * then tracks the player with the highest score.
 */

// Import the Node.js 'fs' module for file system operations.
var   input   =   require('fs') . readFileSync ( '/dev/stdin' ,  'utf8' );


/*
 * Trim leading/trailing whitespace from the input string
 * and split it into an array of lines.
 */
var arr = input . trim() . split ( "\n" );


// Extract N (number of players) and Q (number of queries) from the first line.
// The `shift()` method removes the first element from `arr` and returns it.
// `map(Number)` converts string elements to numbers.
var   nq   =   arr.shift() . split(" ") . map ( Number );


// Initialize an array to store player scores.
var   player   =   [];


// Initialize variables to track the maximum score and the ID of the player with that score.
var   maxValue   =   0;
var   maxId      =   0;


// Initialize all player scores to 0.
for ( var   i   =   0 ;   i   <   nq[0] ;   i++ ) {
   player [ i ]   =   0 ;
}


/*
 * Iterate over each remaining line in the input array.
 * Each line represents a player action (query).
 */
arr . forEach ( function ( V ) {

   // Parse the current action line to get player ID and score change.
   var   av   =   V . split(" ") . map ( Number );

   // Player ID 'a' is 0-indexed, so subtract 1 from the input value.
   var   a   =   av [ 0 ]   -   1 ;

   // The score 'v' to be added or subtracted.
   var   v   =   av [ 1 ] ;


   // Update the player's score.
   player [ a ]   +=   v ;


   // Check conditions for updating the maximum score and maxId.
   if ( a   ==   maxId   &&   v   >=   0 ) {
      // If the current maxId player's score increased, just update maxValue.
      maxValue   +=   v ;
   }

   else if ( ( a   ==   maxId   &&   v   <   0 )   ||   ( a   !=   maxId   &&   v   >   0 ) ) {
      /*
       * If the current maxId player's score decreased,
       * OR if a different player's score increased,
       * we need to re-evaluate who has the maximum score across all players.
       */

      // Initialize a temporary variable to find the new maximum score.
      var   max   =   ( -1   *   Infinity ) ;

      // Iterate through all players to find the one with the highest score.
      player . forEach ( function ( value ,   index ) {

         // If a new maximum score is found...
         if ( max   <   value ) {
            // Update temporary max, global maxValue, and global maxId.
            max   =   value ;
            maxValue   =   value ;
            maxId   =   index ;
         }

      } ) ;

   }

   // Output the (1-indexed) ID of the player with the highest score and their score.
   console . log ( ( maxId   +   1 )   +   " "   +   maxValue ) ;

} ) ;