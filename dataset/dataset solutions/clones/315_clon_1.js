/*
 * This JavaScript code reads input from standard input,
 * processes a series of player scores, and outputs
 * the current leading player's ID and score after each update.
 * It's designed for competitive programming problems.
 */


//  Import the 'fs' (file system) module to read input.
//  The readFileSync method is used to synchronously read the entire content of a file.
//  '/dev/stdin' is a common path for standard input in Unix-like systems.
//  'utf8' specifies the character encoding.
var   input   = require('fs') . readFileSync ( '/dev/stdin' ,  'utf8' ) ;


//  Trim leading/trailing whitespace from the input string.
//  Then, split the string into an array of lines based on the newline character.
var arr = input . trim() . split ( "\n" ) ;


//  The first line of input contains N (number of players) and Q (number of queries).
//  'shift()' removes the first element from 'arr' (the NQ line) and returns it.
//  This line is then split by spaces and each part is converted to a Number.
var nq  = arr . shift() . split ( " " ) . map ( Number ) ;


//  Initialize an empty array to store player scores.
var   player = [ ] ;


//  Initialize a variable to hold the maximum score found so far.
var   maxValue = 0 ;


//  Initialize a variable to hold the ID (index) of the player with the maximum score.
var   maxId = 0 ;


//  Initialize all player scores to 0.
//  nq[0] holds the total number of players.
for ( var  i = 0 ;  i < nq [ 0 ] ;  i ++ )
{ player [ i ] = 0 ; } //  Assign initial score.


/*
 * Iterate over each remaining line in the 'arr' array.
 * Each line represents a query or an update to a player's score.
 */
arr . forEach ( function ( V )
{
   //  Split the current line (V) by space and convert parts to numbers.
   //  av[0] is the player ID (1-indexed), av[1] is the score change.
   var   av = V . split ( " " ) . map ( Number ) ;

   //  Extract the player ID and convert it to 0-indexed.
   var   a = av [ 0 ] - 1 ;

   //  Extract the score change value.
   var   v = av [ 1 ] ;

   //  Update the player's score by adding the change.
   player [ a ] += v ;

   //  Check if the updated player is currently the leader AND the score change was positive or zero.
   if ( ( a == maxId ) && ( v >= 0 ) )
   {
      maxValue += v ; // If so, simply add the change to the leader's score.
   }
   //  Otherwise, if the updated player is the leader AND the score change was negative.
   else if ( ( a == maxId ) && ( v < 0 ) )
   {
      //  A negative change for the leader means we might need to find a new leader.
      var   max = ( -1 * Infinity ) ; // Initialize max score for re-evaluation.

      //  Iterate through all player scores to find the new maximum.
      player . forEach ( function ( value , index )
      {
         //  If a higher score is found, update max, maxValue, and maxId.
         if ( max < value )
         {
            max = value ;
            maxValue = value ;
            maxId = index ;
         }
      } ) ;
   }

   //  Output the ID of the current leading player (1-indexed) and their score.
   console . log ( ( maxId + 1 ) + " " + maxValue ) ;
} ) ;