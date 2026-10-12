function processData() {
  // The first line of input represents the total number of days.
  const numDays = Number(rawData[0]);
  // The second line contains initial cost parameters, which are not used in the score calculation.
  const initialCosts = rawData[1].split(' ').map(Number);
  
  // Extract the lines corresponding to daily scores.
  const dailyScoreStrings = rawData.slice(2, numDays + 2);
  // Convert these string lines into a 2D array of numerical scores.
  const parsedDailyScores = dailyScoreStrings.map((scoreLine) => {
    return scoreLine.split(' ').map(Number);
  });
  // Extract the chosen contest types for each day.
  const chosenContestTypes = rawData.slice(numDays + 2, 2 * numDays + 2).map(Number);
  
  // Initialize the running total score.
  let currentTotalScore = 0;
  // Loop through each day to calculate and display the cumulative score.
  for (let dayIndex = 0; dayIndex < numDays; dayIndex++) {
    // Add the score for the selected contest type on the current day to the total.
    currentTotalScore += parsedDailyScores[dayIndex][chosenContestTypes[dayIndex]];
    // Print the cumulative score after processing each day.
    console.log(currentTotalScore);
  }
}

// A global variable to store all incoming standard input data.
var rawData = '';

// Activate the standard input stream.
process.stdin.resume();
// Set the character encoding for the input stream.
process.stdin.setEncoding('utf8');
// Attach an event listener to accumulate data chunks as they arrive.
process.stdin.on('data', function(dataChunk) {
  rawData += dataChunk;
});
// Attach an event listener for when the input stream ends.
process.stdin.on('end', function() {
  // Split the accumulated raw data into an array of lines.
  rawData = rawData.split('\n');
  // Invoke the primary data processing function.
  processData();
});
