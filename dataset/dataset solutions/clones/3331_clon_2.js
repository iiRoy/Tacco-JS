function ProcessGame( gameData ) {

  gameData = gameData.split( '\n' );
  let gamePieces = parseInt( gameData[0].split( ' ' )[0], 10 );
  const totalStones = parseInt( gameData[0].split( ' ' )[1], 10 );

  const stoneMoves = gameData[1].split( ' ' ).map( moveVal => parseInt( moveVal, 10 ) );

  // This array will store the winning player for each number of stones.
  // 0 indicates undecided, "PlayerA" means first player wins, "PlayerB" means second player wins.
  const gameStates = new Array( totalStones + 1 ).fill( 0 );

  // For stone counts less than the smallest possible move, the second player wins.
  // Assuming the smallest move is stoneMoves[0]
  for ( let currentStoneCount = 0; currentStoneCount < stoneMoves[0]; currentStoneCount++ ) {
    gameStates[currentStoneCount] = "PlayerB";
  }

  // Iterate through all possible stone counts up to the total number of stones.
  for ( let currentStoneCount = stoneMoves[0]; currentStoneCount <= totalStones; currentStoneCount++ ) {

    let canPlayerAWin = false;

    // Check if Player A can make a move that leads to a state where Player B loses (i.e., Player B faces a "PlayerB" state).
    for ( let moveIndex = 0; moveIndex < gamePieces; moveIndex++ ) {

      // Ensure the move is valid (doesn't result in negative stones).
      if ( ( currentStoneCount - stoneMoves[moveIndex] ) >= 0 ) {
        // If Player A can move to a state where the next player (Player B) loses, then Player A wins from the current state.
        if ( gameStates[currentStoneCount - stoneMoves[moveIndex]] === "PlayerB" ) {
          canPlayerAWin = true;
          break; // Found a winning move for Player A.
        }
      }
    }

    // Assign the winning player for the current stone count.
    if ( canPlayerAWin ) {
      gameStates[currentStoneCount] = "PlayerA";
    } else {
      gameStates[currentStoneCount] = "PlayerB";
    }
  }

  const finalOutcome = gameStates[totalStones];

  console.log( 'Game Result: %s', finalOutcome );
  return finalOutcome;
}

// Function for testing the game logic in a browser environment (development helper).
function testSolution( testCaseNumber ) {
  const testInput = document.getElementById( "inputData" + testCaseNumber ).value;
  const computedResult = ProcessGame( testInput );

  let verificationStatus = "Incorrect";
  if ( computedResult === document.getElementById( "expectedOutput" + testCaseNumber ).value.split( '\n' )[0] ) {
    verificationStatus = "Correct";
  }

  document.getElementById( "testOutcome" + testCaseNumber ).innerHTML = verificationStatus;
}

ProcessGame( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );