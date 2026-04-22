function executeGameLogic ( inputStringRows ) {
  // Initialize the score for player A to zero.
  let playerAScore = 0;

  // Initialize the score for player B to zero.
  let playerBScore = 0;


  // Set up an index to navigate through the input string rows.
  let lineIndex = 0;

  // The very first input row specifies the total number of games to be processed.
  // Parse this string into an integer value (base 10).
  let totalGamesCount = parseInt( inputStringRows[lineIndex++], 10 );

  // Loop through each individual game, from the initial game up to the total count.
  for ( let gameIteration = 0; gameIteration < totalGamesCount; gameIteration++ ) {

    // Retrieve the current game's data line and split it by any whitespace
    // to get the individual card values for this round.
    let roundCardValues = inputStringRows[lineIndex++].split( /\s+/ );

    // Compare the card values of the two players.
    // The comparison logic here is based on string comparison.
    if ( roundCardValues[0] === roundCardValues[1] ) {
      // If both players' cards are identical, it's a draw for the round.
      // Each player receives one point.
      playerAScore += 1;
      playerBScore += 1;
    } else if ( roundCardValues[0] > roundCardValues[1] ) {
      // If player A's card is lexicographically greater, player A wins the round.
      // Player A is awarded three points.
      playerAScore += 3;
    } else if ( roundCardValues[0] < roundCardValues[1] ) {
      // If player B's card is lexicographically greater, player B wins the round.
      // Player B is awarded three points.
      playerBScore += 3;
    }
  }

  // After all games have been completed and scores tallied,
  // display the final scores for both players to the console.
  console.log( playerAScore, playerBScore );
}


// Create an array to collect all incoming data chunks from standard input.
let collectedInputChunks = [];

// Attach an event listener to the standard input stream for 'data' events.
// This function will be executed whenever a new piece of data arrives.
process.stdin.on( 'data', function ( inputDataChunk ) {
  // Push the newly received data chunk into our collection array.
  collectedInputChunks.push( inputDataChunk );
} );

// Attach an event listener to the standard input stream for the 'end' event.
// This function will be executed once all input data has been received.
process.stdin.on( 'end', function () {
  // Combine all the collected data chunks into a single string,
  // then split this string into an array of individual lines using the newline character.
  let finalInputLines = collectedInputChunks.join( '' ).split( '\n' );

  // Invoke the main game logic processing function with the prepared lines of input.
  executeGameLogic( finalInputLines );
} );