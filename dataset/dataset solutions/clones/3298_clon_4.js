'use strict';
(function(sourceText){
  const processedLines = sourceText.trim().split('\n');
  
  // The first line specifies the number of subsequent data rows.
  // For the functional approach, we can simply slice the array to get only the data.
  const numericalDataGrid = processedLines.slice(1).map(lineContent => 
    lineContent.split(' ').map(Number) // Convert each string element to a number
  );

  // Initialize the base scores for a hypothetical 'level 0' with all zeros.
  // This serves as the starting point for accumulation.
  const initialAccumulatedScores = [0, 0, 0];

  // Use Array.prototype.reduce to iteratively calculate the maximum scores.
  // The accumulator 'previousLevelResults' holds the max scores for the previous row,
  // ending at each of the three positions (0, 1, 2).
  // 'currentLevelElements' represents the values in the current row being processed.
  const finalLevelAggregates = numericalDataGrid.reduce((previousLevelResults, currentLevelElements) => {
    const currentLevelResults = [];
    
    // To calculate the maximum score for position 0 in the current row,
    // we must have come from position 1 or 2 in the previous row.
    currentLevelResults[0] = Math.max(previousLevelResults[1], previousLevelResults[2]) + currentLevelElements[0];
    
    // To calculate the maximum score for position 1 in the current row,
    // we must have come from position 2 or 0 in the previous row.
    currentLevelResults[1] = Math.max(previousLevelResults[2], previousLevelResults[0]) + currentLevelElements[1];
    
    // To calculate the maximum score for position 2 in the current row,
    // we must have come from position 0 or 1 in the previous row.
    currentLevelResults[2] = Math.max(previousLevelResults[0], previousLevelResults[1]) + currentLevelElements[2];
    
    return currentLevelResults; // Return the calculated scores for the current level as the accumulator for the next
  }, initialAccumulatedScores); // Start reduction with the initial base scores

  // After processing all data rows, 'finalLevelAggregates' will contain the
  // maximum scores for ending at each of the three positions in the last row.
  // The overall maximum is the largest of these three values.
  const overallHighestScore = Math.max(...finalLevelAggregates);
  
  console.log(overallHighestScore);
})(require('fs').readFileSync('/dev/stdin','utf8'));