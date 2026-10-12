'use strict';
(function(inputSource) {
  // This function assesses a set of scores and returns a corresponding grade.
  function evaluateScores(scoreSet) {
    // Check for specific invalid input indicating an immediate failure.
    if ([scoreSet[0], scoreSet[1]].indexOf('-1') !== -1) {
      return 'F'; // Return 'F' if either of the first two scores is -1.
    }

    // Calculate the combined total of the first two scores.
    let totalPoints = scoreSet[0] + scoreSet[1];

    // Define the numeric boundaries for each grade category.
    const thresholds = [80, 65, 50, 30, 0];
    // Define the grade labels, including a conditional grade for the third score.
    const resultLabels = ['A', 'B', 'C', determinePassFail(scoreSet[2]), 'F'];

    // Iterate through the grade thresholds to find the appropriate grade.
    for (let idx = 0; idx < 5; idx++) {
      // If the total points meet or exceed the current threshold, assign the corresponding grade.
      if (totalPoints >= thresholds[idx]) {
        return resultLabels[idx];
      }
    }
  }

  // This helper function determines a 'C' or 'D' grade based on a single score.
  function determinePassFail(individualScore) {
    // If the score is 50 or above, it's a 'C', otherwise it's a 'D'.
    return individualScore >= 50 ? 'C' : 'D';
  }

  // Process the raw input data.
  const rawInputLines = inputSource.toString().trim().split('\n');
  // Filter and transform the input lines into an array of number arrays.
  const processedData = rawInputLines.slice(0, rawInputLines.indexOf('-1 -1 -1')).map(function(lineSegment) {
    return lineSegment.split(' ').map(Number); // Split by space and convert to numbers.
  });

  // Apply the grading function to each processed data set and join the results with newlines.
  console.log(processedData.map(evaluateScores).join('\n'));
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
