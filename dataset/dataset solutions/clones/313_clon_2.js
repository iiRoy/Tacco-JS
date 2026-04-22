const rawTextContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// The raw text content read from the input is processed.
let lineArrayOfStrings = rawTextContent.trim().split("\n");

// The first line of input contains essential configuration parameters.
const systemParameters = lineArrayOfStrings.shift().split(" ").map(Number);

// An array to keep track of the current scores for all participating entities.
let participantScores = [];

// This variable holds the maximum score found among all participants at any given time.
let currentHighestScore = 0;

// This variable stores the zero-based index of the participant who currently holds the highest score.
let topScorerIndex = 0;

// Initialize scores for all participants to zero based on the count provided in the input.
for (let participantIndex = 0; participantIndex < systemParameters[0]; participantIndex++) {
    participantScores[participantIndex] = 0;
}

// Process each subsequent line, which represents an action or score update.
lineArrayOfStrings.forEach(function(currentQueryLine) {
   // Parse the current line into numeric values; typically a participant ID and a score adjustment.
   const queryValues = currentQueryLine.split(" ").map(Number);

   // Extract the target participant's index, adjusting for 0-based indexing.
   const targetParticipantIdx = queryValues[0] - 1;

   // Extract the value by which the participant's score should be modified.
   const scoreModifier = queryValues[1];

   // Apply the score modification to the target participant's total score.
   participantScores[targetParticipantIdx] += scoreModifier;

   // If the updated participant is currently the top scorer and their score has increased or stayed the same,
   // simply update the highest score value.
   if (targetParticipantIdx === topScorerIndex && scoreModifier >= 0) {
      currentHighestScore += scoreModifier;
   }
   // If a different participant's score decreased, no immediate re-evaluation of the maximum is needed.
   else if (targetParticipantIdx !== topScorerIndex && scoreModifier < 0) {
      // No specific action required here, as per the original logic.
   }
   // In all other scenarios (e.g., top scorer's score decreased, or another participant's score increased),
   // a full re-evaluation of the highest score and top scorer's index is necessary.
   else {
      // Initialize a temporary variable to find the new maximum score during re-evaluation.
      let temporaryMaxScore = Number.NEGATIVE_INFINITY;

      // Iterate through all participant scores to identify the new highest score and its owner.
      participantScores.forEach(function(individualScore, scoreIndex) {
         // If a score higher than the current temporary maximum is found, update all relevant maximum values.
         if (temporaryMaxScore < individualScore) {
            temporaryMaxScore = individualScore;
            currentHighestScore = individualScore;
            topScorerIndex = scoreIndex;
         }
      });
   }
   // Output the 1-based index of the current top scorer and their score.
   console.log((topScorerIndex + 1) + " " + currentHighestScore);
});