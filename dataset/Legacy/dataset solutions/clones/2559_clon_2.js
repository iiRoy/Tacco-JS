function ProcessInput(rawData) {
  // Split the raw input string into an array of lines.
  rawData = rawData.split('\n');

  // Parse the first line to get game parameters.
  var parts = rawData[0].split(' ');
  var numParticipants = parseInt(parts[0]); // Total number of players
  var minScore = parseInt(parts[1]);       // Minimum score to pass
  var numRounds = parseInt(parts[2]);      // Total number of rounds played

  // Initialize an array to store scores for each participant.
  // All participants start with a score of 0.
  var participantScores = new Array(numParticipants);

  // Iterate through each round of the game.
  for (var roundIndex = 1; roundIndex <= numRounds; roundIndex++) {
    // For each round, iterate through all participants.
    for (var participantIndex = 0; participantIndex < numParticipants; participantIndex++) {
      // On the very first round, ensure all scores are initialized to zero.
      if (roundIndex === 1) {
        participantScores[participantIndex] = 0;
      }

      // If the current participant did NOT win this round (based on input).
      // The input line `rawData[roundIndex]` indicates the winner of that round.
      // `participantIndex + 1` is used because participants are 1-indexed in the input.
      if (parseInt(rawData[roundIndex]) !== (participantIndex + 1)) {
        // Increment the score for participants who did not win the current round.
        participantScores[participantIndex]++;
      }
    }
  }

  // After all rounds, evaluate each participant's final score.
  participantScores.forEach(function(currentScore) {
    // If a participant's score is greater than or equal to the minimum required score,
    // they "fail" (output 'No' as per problem logic). Otherwise, they "pass" (output 'Yes').
    (currentScore >= minScore) ? console.log('No') : console.log('Yes');
  });
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
