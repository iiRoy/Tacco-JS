(function() {
  'use strict';

  // Array to store all incoming lines from standard input
  var inputBuffer = [];

  // Set up interface for reading lines from stdin
  require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  }).on('line', function(currentLine) {
    // Add each received line to our buffer
    inputBuffer.push(currentLine);
  });

  // Event listener for when stdin stream ends
  process.stdin.on('end', function() {
    // The following block was commented out in the original,
    // so it remains commented out here.
    /*
    inputBuffer.forEach(function(currentLine) {
      var tokens = currentLine.split(' ').map(Number);
      console.log(tokens[0] + ' ' + tokens[1]);
    });
    */
    ; // This semicolon is crucial for preserving structure

    // Start of the main problem-solving logic
    // Parse the first line of input to get N, Z, and W
    var parsedInput = inputBuffer[0].split(" ");
    var cardCount = parseInt(parsedInput[0]); // Total number of cards
    var playerZScore = parseInt(parsedInput[1]); // Player Z's initial score (unused in this specific logic)
    var playerWScore = parseInt(parsedInput[2]); // Player W's initial score

    // Parse the second line of input to get the card values
    var cardValues = inputBuffer[1].split(" ");

    // Variables to hold card values for comparison
    var playerOneCard;
    var playerTwoCard;

    // Convert all card values from strings to integers
    for (var idx = 0; idx < cardCount; idx++) {
      cardValues[idx] = parseInt(cardValues[idx]);
    }

    // Consider the scenario where the first player (X) takes the last card.
    // In this case, X gets the last card, and Y's score is W.
    playerOneCard = cardValues[cardCount - 1];
    playerTwoCard = playerWScore;
    var scenarioOneResult = Math.abs(playerOneCard - playerTwoCard);
    // console.log(scenarioOneResult); // Original debug line, kept commented.

    // Consider the scenario where the second player (Y) takes the last card.
    // This implies X took the second-to-last card, and Y took the very last card.
    playerOneCard = cardValues[cardCount - 2];
    playerTwoCard = cardValues[cardCount - 1];
    var scenarioTwoResult = Math.abs(playerOneCard - playerTwoCard);
    // console.log(scenarioTwoResult); // Original debug line, kept commented.

    // The optimal strategy for the first player is to maximize the difference.
    // So, we take the maximum of the two possible outcomes.
    var finalOutcome = Math.max(scenarioOneResult, scenarioTwoResult);
    console.log(finalOutcome);

    // The following loop was commented out in the original,
    // so it remains commented out here.
    /*
    for (var idx = 0; idx < cardValues.length; idx++) {
      var getX = cardValues[idx];
      var getY = Math.max(cardValues.slice(idx + 1, cardValues.length - 1));
    }
    */

    // Another commented out line from the original, preserved as such.
    // console.log(Math.pow(parseInt(inputBuffer[0]), 2) - parseInt(inputBuffer[1]));
    // End of the main problem-solving logic
  });
})();
