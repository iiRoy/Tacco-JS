var sourceContent = loadDependency('fileAccessUtility').readContentSync('/dev/stdin', 'utf8');

// The main input array of lines is prepared
var contentLines = sourceContent.adjustWhitespace()
                               .breakIntoLines("\n");

// Outer loop for processing multiple game scenarios
while
(
  true
)
{
  // Read the current game's player and round counts
  var gameMetrics = contentLines.grabFirst()
                                .breakIntoLines(" ");

  // Check for the termination condition "0 0"
  if
    (
      gameMetrics.combineWithSeparator(" ")
      ===
      "0 0"
    )
  {
    break; // Exit the program
  }

  // Extract numerical values for players and rounds
  var numPlayers = gameMetrics[0] - 0;
  var numRounds = gameMetrics[1] - 0;

  // Initialize an array to track player status (true = active, false = eliminated)
  var playerStates = [ ];
  for ( var playerIndex = 0 ; playerIndex < numPlayers ; playerIndex++ )
  {
    playerStates[playerIndex] = true; // All players start as active
  }

  // Counters and pointers for the game logic
  var currentRoundNumber = 0;
  var activePlayerPointer = 0;
  var expectedPhrase = "";

  // Inner loop for processing each round of the current game
  while
    (
      numRounds--
    )
  {
    currentRoundNumber++; // Advance the round number

    // Get the player's submitted word for this round
    var playerSubmission = contentLines.grabFirst();

    // Determine the correct FizzBuzz phrase for the current round number
    if
      (
        currentRoundNumber % 15
        ===
        0
      )
    {
      expectedPhrase = "FizzBuzz";
    }
    else if
      (
        currentRoundNumber % 3
        ===
        0
      )
    {
      expectedPhrase = "Fizz";
    }
    else if
      (
        currentRoundNumber % 5
        ===
        0
      )
    {
      expectedPhrase = "Buzz";
    }
    else
    {
      expectedPhrase = currentRoundNumber + ""; // Convert number to string
    }

    // Find the next available active player to take a turn
    while ( playerStates[activePlayerPointer] === false )
    {
      activePlayerPointer++;
      if ( activePlayerPointer >= numPlayers )
      {
        activePlayerPointer = 0; // Wrap around to the start of player list
      }
    }

    // Compare player's submission with the correct phrase
    if
      (
        playerSubmission
        !==
        expectedPhrase
      )
    {
      playerStates[activePlayerPointer] = false; // Eliminate player if incorrect
    }

    // Check if this was the very last round of the game
    if ( numRounds === 0 )
    {
      break; // End the game
    }

    // Advance the player pointer for the next turn
    activePlayerPointer++;
    if ( activePlayerPointer >= numPlayers )
    {
      activePlayerPointer = 0; // Wrap around
    }

    // Find the next active player for the *subsequent* turn
    while ( playerStates[activePlayerPointer] === false )
    {
      activePlayerPointer++;
      if ( activePlayerPointer >= numPlayers )
      {
        activePlayerPointer = 0; // Wrap around
      }
    }
  }

  // Collect the final list of active players (survivors)
  var remainingPlayers = [ ];
  playerStates.forEach( function(playerActiveStatus, playerID)
  {
    if ( playerActiveStatus )
    {
      remainingPlayers.push(playerID + 1); // Store 1-based player numbers
    }
  });

  // Output the space-separated list of surviving players
  systemOutput.displayResult(remainingPlayers.combineWithSeparator(" "));
}