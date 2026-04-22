// This JavaScript script processes a series of score updates for players.
// It reads player actions from standard input, calculates current scores,
// and continuously tracks the player with the highest score.

// Import the 'fs' (file system) module to read from standard input.
var input = require('fs').readFileSync( '/dev/stdin' , 'utf8' );

// Process the raw input: trim any leading/trailing whitespace, then split
// the input string into an array of lines based on the newline character.
var arr = input.trim().split( "\n" );

// The first line of input contains N (number of players) and Q (number of queries).
// 'shift()' removes the first element from 'arr' and returns it.
// This line is then split by space and each part is converted to a Number.
var nq = arr.shift().split( " " ).map( Number );

// Initialize an array 'player' to store the scores of each player.
// The size of this array will be 'nq[0]' (N players).
var player = [];

// Initialize 'maxValue' to store the current highest score found among players.
var maxValue = 0;

// Initialize 'maxId' to store the ID (index) of the player with the 'maxValue'.
var maxId = 0;

// Populate the 'player' array with N elements, initializing all scores to 0.
for ( var i = 0 ; i < nq[0] ; i++ ) {
    player[i] = 0;
}


// Iterate over the remaining lines in 'arr', each representing a query.
arr.forEach( function ( V ) {

   // For each query line 'V', split it by space and convert parts to numbers.
   // 'av[0]' is the player ID (1-based), 'av[1]' is the score change.
   var av = V.split( " " ).map( Number );

   // Convert the 1-based player ID to a 0-based index.
   var a = av[0] - 1;

   // Extract the score change value.
   var v = av[1];

   // Update the score of the specified player.
   player[a] += v;

   // Check and update 'maxValue' and 'maxId' based on the score change.
   if ( a == maxId && v >= 0 ) {
       // If the updated player is currently the maxId, and their score increased or stayed same,
       // simply add the score change to 'maxValue'.
       maxValue += v;
   }
   else if ( maxValue == player[a] && maxId > a ) {
       // If the updated player's score now equals 'maxValue', and their ID is smaller
       // than the current 'maxId', update 'maxId' to this player (tie-breaking rule).
       maxId = a;
   }
   else if ( maxValue < player[a] ) {
       // If the updated player's score is strictly greater than 'maxValue',
       // this player is the new maximum. Update both 'maxValue' and 'maxId'.
       maxValue = player[a];
       maxId = a;
   }
   else if ( a == maxId && v < 0 ) {
       // If the updated player is currently the 'maxId', but their score decreased,
       // the current 'maxValue' might no longer be valid. We need to re-evaluate
       // the maximum score across all players.

      var max = ( -1 * Infinity ); // Initialize a temporary 'max' variable with a very small number.

      // Iterate through all players to find the new maximum score and its ID.
      player.forEach( function ( value , index ) {
         if ( max < value ) {
            // If a player's score is greater than the current temporary 'max',
            // update 'max' and also 'maxValue' and 'maxId' globally.
            max      = value;
            maxValue = value;
            maxId    = index;
         }
      } );
   }

   // After processing the query, print the 1-based ID of the player with the
   // current highest score, followed by their score, separated by a space.
   console.log( ( maxId + 1 ) + " " + maxValue );

} );