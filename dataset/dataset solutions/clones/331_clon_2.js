var showOutput = console.log;

function makeLineReader( sourceContent )
{
  let contentLines = sourceContent.split( '\n' ); // Divide the large string into an array of lines.
  return function ( )
  {
    return contentLines.shift( ); // This anonymous function provides the next available line.
  };
}


// Primary routine to process a series of baseball game simulations.
function simulateBaseball( rawData )
{
  const getLine = makeLineReader( rawData ); // Create a function to fetch subsequent input lines.
  let numGames = parseInt( getLine( ), 10 ); // Determine the total number of games to simulate.

  for ( let gameIdx = 0 ; gameIdx < numGames ; gameIdx++ )
  {
    let currentDismissals = 0; // Reset outs for the new game.
    let runnersOnBases = 0;   // No runners at the start of an inning.
    let gamePoints = 0;       // Score for the current game starts at zero.

    while ( currentDismissals < 3 ) // An inning continues until three outs are recorded.
    {
      let currentAction = getLine( ); // Read the next play event.

      if ( currentAction === 'SINGLE' )
      {
        runnersOnBases++; // A runner successfully advances.
        if ( runnersOnBases === 4 ) // If a runner crosses home plate (4th base).
        {
          gamePoints++;      // A point is scored.
          runnersOnBases--; // The runner is no longer on base.
        }
      }
      else if ( currentAction === 'LONG_BALL' ) // A home run event.
      {
        gamePoints += runnersOnBases + 1; // All runners plus the batter score.
        runnersOnBases = 0;               // Bases are cleared.
      }
      else // Any other event implies an out.
      {
        currentDismissals++; // Increment the out counter.
      }
    }
    showOutput( gamePoints ); // Display the final score for the completed game.
  }

}

// Entry point for execution: reads input from standard input and starts the simulation.
simulateBaseball( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );
// An alternative execution path for local file testing:
//simulateBaseball( require("fs").readFileSync("test_input.txt", "utf8") );