/*
 * This file contains the implementation of a simplified Baseball game simulation.
 * It processes commands to simulate actions like hits, home runs, and outs.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 */


// Define the Baseball class constructor.
var Baseball  =  function ( attackCount )
{
  // Initialize instance properties.
  this.attackCount = +attackCount; // Ensure attackCount is a number
  this.outCount    = 0;            // Current number of outs
  this.endCount    = attackCount * 3; // Total outs to end the game
  this.runners     = [ ];          // Array to track runners on base
  this.score       = 0;            // Current score
  this.isChanged   = false;        // Flag (unused in provided logic, but kept for structural integrity)
} ;


// Method to check if the game has ended.
Baseball.prototype.isEnd = function ( )
{
  return this.outCount  ===  this.endCount ; // Compare current outs with total required outs
} ;


// Method to echo the score and reset game state after an inning change.
Baseball.prototype.echo = function ( )
{
  console.log( this.score ) ; // Output the current score
  this.score   = 0 ;         // Reset score for the next inning
  this.runners = [ ] ;       // Clear all runners from bases
} ;


// Main action method to process game commands.
Baseball.prototype.action = function ( command )
{
  // Use a switch statement to handle different commands.
  switch ( command )
  {
    case 'HIT' :
      // A hit puts a new runner on base and advances existing runners.
      this.runners.push( 0 ) ;
      this.runners = this.runners.map( function ( r ) { return r + 1 ; } ) ;

      // Check if the first runner scores (reaches 4th base).
      if ( this.runners[ 0 ] === 4 )
      {
        this.score += 1 ;         // Increment score
        this.runners.shift( ) ;   // Remove the scoring runner
      }
      break ; // End of 'HIT' case

    case 'HOMERUN' :
      // A homerun scores all existing runners plus the batter.
      this.score += this.runners.length + 1 ;
      this.runners = [ ] ; // Clear all runners
      break ; // End of 'HOMERUN' case

    case 'OUT' :
      // An out increments the out count.
      this.outCount += 1 ;
      // If 3 outs are made, it's an inning change.
      if ( this.outCount % 3 === 0 )
      {
          return 'change' ; // Signal an inning change
      }
      break ; // End of 'OUT' case
  }
  return 'next' ; // Default return for continuing the game
} ;


/*
 * Main execution block for reading input and running the simulation.
 */

// Read input from stdin, trim, and split by newlines.
var d  =  require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) . split ( '\n' ) ;

// Create a new Baseball game instance with the first line of input as attackCount.
var bb = new Baseball ( d.shift ( ) ) ;

// Main game loop.
while ( true )
{
  // Process the next command from input.
  if ( bb.action ( d.shift ( ) ) === 'change' )
  {
    bb.echo ( ) ; // Echo score and reset if an inning change occurred.

    // Check if the game has ended after the inning change.
    if ( bb.isEnd ( ) )
    {
        break ; // Exit loop if the game is over.
    }
  }
}