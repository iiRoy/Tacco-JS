/*
 * This script reads input from standard input, processes each line,
 * and performs calculations based on numerical values found within.
 * It's designed to solve a specific problem involving number manipulation.
 */
var input = require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' );

var lines = input.split( '\n' );


// Main loop: continues as long as there are lines to process.
while ( line = lines.shift() )
{
  // Parse the current line into an array of integers.
  var s = line.split( ' ' ).map( function( a ) { return parseInt( a ); } );

  // Construct 'args' array by summing specific elements from 's'.
  var args = [
    + s[0] + s[3],
    + s[1] + s[4],
    + s[2] + s[5]
  ];

  // Check for the termination condition: if sum of args is zero, exit.
  if ( args[0] + args[1] + args[2] == 0 )
  {
    process.exit();
  }

  // Initialize counter 'k' for the current line's calculation.
  var k = 0;

  // First processing pass: handle divisions by 3 and remainders.
  for ( var i = 0; i < args.length; i++ )
  {
    k += Math.floor( args[i] / 3 ); // Add integer quotient to 'k'.
    args[i] %= 3;                   // Update arg to its remainder.
  }

  // Second processing pass: iteratively decrement if all args are at least 1.
  while ( true )
  {
    if ( args[0] >= 1 && args[1] >= 1 && args[2] >= 1 )
    {
      k ++;           // Increment 'k'.
      args[0]--;      // Decrement each arg.
      args[1]--;
      args[2]--;
    }
    else
    {
      // Break the loop if the condition is no longer met.
      break;
    }
  }

  // Output the final calculated value for 'k'.
  console.log( k );
}