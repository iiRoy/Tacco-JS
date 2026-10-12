var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var lineBuffer = (rawData.trim()).split("\n"); // Split input into lines

while (true) {
   // Read the first line of each test case, containing N and M
   var dimensions = lineBuffer.shift().split(" ").map(Number);

   // Check for termination condition (N=0 and M=0)
   if (dimensions[0] === 0 && dimensions[1] === 0) {
      break;
   }

   // Initialize an array to store participant data: [participant_id, total_score]
   var scoreData = [];
   for (var idx = 0; idx < dimensions[1]; idx++) {
      scoreData[idx] = [idx + 1, 0]; // Participant IDs are 1-based
   }

   // Process N lines of scores
   for (var idx = 0; idx < dimensions[0]; idx++) {
      var currentScores = lineBuffer.shift().split(" ").map(Number); // Scores for the current round
      currentScores.forEach(function(scoreValue, participantIndex) {
         scoreData[participantIndex][1] += scoreValue; // Add score to total for each participant
      });
   }

   // Sort the participants based on their total scores
   // Primary sort: descending by total score
   // Secondary sort: ascending by participant ID if scores are equal
   scoreData.sort(function(itemA, itemB) {
      if (itemA[1] === itemB[1]) {
         return itemA[0] - itemB[0]; // Sort by ID ascending
      } else {
         return itemB[1] - itemA[1]; // Sort by score descending
      }
   });

   // Extract only the participant IDs in the sorted order
   var resultOrder = [];
   scoreData.forEach(function(participantEntry, entryIndex) {
      resultOrder.push(scoreData[entryIndex][0]);
   });

   // Print the sorted participant IDs, space-separated
   console.log(resultOrder.join(" "));
}
