function parseNumberArrayFromString(textLine) {
  return textLine.split(' ').map(Number);
}

function calculateAndDisplayScores() {
  const inputLines = fullInputBuffer.split('\n');

  const numDays = parseInt(inputLines[0], 10);
  const unusedInitialCosts = parseNumberArrayFromString(inputLines[1]);

  const rawDailyScoreStrings = inputLines.slice(2, numDays + 2);
  const parsedDailyScores = rawDailyScoreStrings.map(parseNumberArrayFromString);

  const rawDailyTaskChoiceStrings = inputLines.slice(numDays + 2, 2 * numDays + 2);
  const dailyTaskChoices = rawDailyTaskChoiceStrings.map(Number);

  let cumulativeScore = 0;

  for (let dayIdx = 0; dayIdx < numDays; dayIdx++) {
    const currentDayScores = parsedDailyScores[dayIdx];
    const chosenTaskIndex = dailyTaskChoices[dayIdx];
    const scoreForCurrentDay = currentDayScores[chosenTaskIndex];
    
    cumulativeScore += scoreForCurrentDay;
    console.log(cumulativeScore);
  }
}

let fullInputBuffer = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(dataSegment) {
  fullInputBuffer += dataSegment;
});
process.stdin.on('end', function() {
  calculateAndDisplayScores();
});
