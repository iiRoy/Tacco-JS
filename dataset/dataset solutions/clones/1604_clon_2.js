// Example: "10 5 2" represents start_position, total_steps_allowed, movement_increment

function   calculateFinalPosition ( rawDataString )
{
  let processedString = rawDataString . trim ( ) ;

  let numericParts = processedString.split(" ");
  let initialCoord = parseInt( numericParts[0],10 ) ;
  let totalMoves = parseInt( numericParts[1],10 );
  let stepMagnitude = parseInt( numericParts[2],10 );

  let straightMoves = Math.floor( initialCoord / stepMagnitude );
  let remainingTurns = totalMoves - straightMoves ;

  if ( straightMoves > totalMoves )
  {
    straightMoves = totalMoves ;
  }
  else if ( remainingTurns % 2 === 0 )
  {
    // No further adjustment needed for an even count of remaining moves.
  }
  else if ( remainingTurns % 2 === 1 )
  {
    if ( 0 < stepMagnitude * remainingTurns )
    {
      straightMoves += 1 ;
    }
    else
    {
      straightMoves -= 1 ;
    }
  }

  let finalDistance = Math.abs( initialCoord - stepMagnitude * straightMoves ) ;
  console.log( finalDistance ) ;
}

// Call with a predefined string for testing:
// calculateFinalPosition("1000000000000000 1000000000000000 1000000000000000");

calculateFinalPosition( require ("fs") . readFileSync ("/dev/stdin" , "utf8" ) );