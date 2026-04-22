const fileSystemUtility = require('fs');
let rawTextualData = fileSystemUtility.readFileSync('/dev/stdin', 'utf8');

// Clean up the raw input: remove leading/trailing whitespace and then split
// the entire string into an array of individual lines.
let dataLines = rawTextualData
  .trim()
  .split('\n');

// The very first line of the input contains configuration settings.
// We extract it, split by spaces, and convert each part to a number.
const configurationSettings = dataLines
  .shift()
  .split(' ')
  .map(Number);

// Initialize an array to hold the scores for each participant.
let competitorScores = [];

// Variables to track the highest score and the index of the participant
// who currently holds that score.
let peakScoreValue = 0;
let leadingCompetitorIndex = 0;

// Populate the competitorScores array with initial zero values for all participants.
// The number of participants is given by the first configuration setting.
for (let competitorIdx = 0; competitorIdx < configurationSettings[0]; competitorIdx++) {
  competitorScores[competitorIdx] = 0;
}

// Iterate through each remaining line in the dataLines array.
// Each line represents an operation to update a participant's score.
dataLines.forEach(function(currentOperationLine) {
  // Parse the current line to extract the participant's ID and the score adjustment.
  const updateDetails = currentOperationLine
    .split(' ')
    .map(Number);
  const targetCompetitorId = updateDetails[0] - 1; // Adjust to 0-based indexing
  const scoreAdjustment = updateDetails[1];

  // Apply the calculated score adjustment to the relevant participant's score.
  competitorScores[targetCompetitorId] += scoreAdjustment;

  // Logic to determine if the highest score or leading participant has changed.
  // Scenario A: The current leader's score increased or remained the same.
  if (targetCompetitorId === leadingCompetitorIndex && scoreAdjustment >= 0) {
    peakScoreValue += scoreAdjustment;
  }
  // Scenario B: The current leader's score decreased, OR
  // a different participant's score increased. A full re-evaluation is needed.
  else if (
    (targetCompetitorId === leadingCompetitorIndex && scoreAdjustment < 0) ||
    (targetCompetitorId !== leadingCompetitorIndex && scoreAdjustment > 0)
  ) {
    // Reset temporary maximum for finding the new highest.
    let temporaryMax = -Infinity;
    competitorScores.forEach(function(individualCompetitorScore, currentScoreIdx) {
      if (temporaryMax < individualCompetitorScore) {
        temporaryMax = individualCompetitorScore;
        peakScoreValue = individualCompetitorScore;
        leadingCompetitorIndex = currentScoreIdx;
      }
    });
  }

  // Output the 1-based index of the participant with the highest score
  // and their current peak score value.
  console.log((leadingCompetitorIndex + 1) + ' ' + peakScoreValue);
});