// This function processes the incoming string data.
function ProcessGameData ( rawData )
{
  var linesOfData = rawData.split ( '\n' ) ;
  var gameOutcome ;

  // Initialize the sequence of characters for the game
  var characterSequence = linesOfData [ 0 ].split ( '' ) ;
  var activePlayer = 'PlayerOne' ; // The current player in control

  /*
   * This subroutine handles the removal of a character segment from the main sequence.
   * It takes an array of three indices.
   */
  function removeSegment ( segmentIndices )
  {
    characterSequence.splice ( segmentIndices [ 1 ] , 1 ) ;
    console.log ( characterSequence ) ; // For debugging purposes, shows sequence after removal
  }

  /*
   * Determines if a specific three-character segment can be removed.
   * A segment can be removed if its first and third characters are not identical.
   */
  function isValidRemoval ( segmentIndices )
  {
    return ! ( characterSequence [ segmentIndices [ 0 ] ] === characterSequence [ segmentIndices [ 2 ] ] ) ;
  }

  // Executes a single turn of the game for the current player.
  function executeMove ( currentSequence )
  {
    var segmentIndices ; // Stores the three indices being evaluated

    // Iterate through the sequence to find a valid removal
    for ( let idx = 0 ; idx < ( currentSequence.length - 2 ) ; idx++ )
    {
      segmentIndices = [ idx , idx + 1 , idx + 2 ] ; // Define the triplet of indices

      if ( isValidRemoval ( segmentIndices ) )
      {
        removeSegment ( segmentIndices ) ;
        return true ; // A valid move was made
      }
    }
    return false ; // No valid moves could be made in this turn
  }

  // Manages the progression of game rounds until no more moves are possible.
  function manageGameRounds ( )
  {
    while ( true )
    {
      if ( executeMove ( characterSequence ) === false )
      {
        return ; // Game ends if no move is possible
      }

      // Switch active participant for the next round
      if ( activePlayer === 'PlayerOne' )
      {
        activePlayer = 'PlayerTwo' ;
      }
      else
      {
        activePlayer = 'PlayerOne' ;
      }
    }
  }

  manageGameRounds ( ) ; // Start the game process

  // Determine the final winner based on who made the last move
  if ( activePlayer === 'PlayerOne' )
  {
    gameOutcome = 'PlayerTwo' ; // If PlayerOne made the last move, PlayerTwo wins
  }
  else
  {
    gameOutcome = 'PlayerOne' ; // If PlayerTwo made the last move, PlayerOne wins
  }

  // Display the final result
  console.log ( gameOutcome ) ;
}
/* This line and beyond should not be modified (reads from standard input and invokes ProcessGameData) */
ProcessGameData ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;