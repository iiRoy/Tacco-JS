var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// This variable will hold the input lines after trimming and splitting.
var lineSegments = (rawData.trim()).split("\n");

// The main processing loop continues until a specific termination condition is met.
while (true) {
   // Extract the dimensions (N and M) for the current dataset from the first line.
   // N represents the number of rounds, M represents the number of participants.
   var dimensions = (lineSegments.shift()).split(" ").map(Number);

   // Check if both N and M are zero, which signals the end of input.
   if (dimensions[0] === 0 && dimensions[1] === 0) {
      break; // Exit the infinite loop.
   }

   // Initialize an array to store participant scores.
   // Each inner array will contain [participant_identifier, total_score].
   var scoreData = [];
   // Populate the scoreData array with initial participant IDs and zero scores.
   // Participant IDs are 1-based.
   for (var participantIdx = 0; participantIdx < dimensions[1]; participantIdx++) {
      scoreData[participantIdx] = [participantIdx + 1, 0];
   }

   // Process each of the N rounds of scores.
   for (var roundIdx = 0; roundIdx < dimensions[0]; roundIdx++) {
      // Read the scores for the current round.
      var currentRoundScores = (lineSegments.shift()).split(" ").map(Number);
      // Iterate through the scores of the current round and add them to the
      // respective participant's total score.
      currentRoundScores.forEach(function(scoreValue, participantIndex) {
         scoreData[participantIndex][1] += scoreValue;
      });
   }

   // Sort the participants based on their total scores.
   // Primary sort criterion: descending order of total score.
   // Secondary sort criterion (for ties): ascending order of participant ID.
   scoreData.sort(function(participantA, participantB) {
      // If total scores are equal, sort by participant ID.
      if (participantA[1] === participantB[1]) {
         return participantA[0] - participantB[0];
      }
      // Otherwise, sort by total score in descending order.
      else {
         return participantB[1] - participantA[1];
      }
   });

   // Create a new array to store only the participant IDs in the sorted order.
   var finalOrder = [];
   // Extract the participant ID from each sorted entry.
   scoreData.forEach(function(scoreEntry) {
      finalOrder.push(scoreEntry[0]);
   });

   // Output the sorted participant IDs, joined by spaces.
   console.log(finalOrder.join(" "));
}
