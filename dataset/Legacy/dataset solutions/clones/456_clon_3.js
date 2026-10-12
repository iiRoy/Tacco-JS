var rawInputBuffer = '';

function processLoanScenarios(processedLines) {
  var
    currentInputLineIndex = 0,
    currentMonthIndex,
    solutionFoundForScenario,
    loanBalance,
    monthlyFigures;

  const TOTAL_MONTHS_IN_YEAR = 12;

  while (true) {
    loanBalance = Number(processedLines[currentInputLineIndex++]);
    if (loanBalance === 0) {
      break;
    }

    solutionFoundForScenario = true;

    for (currentMonthIndex = 0; currentMonthIndex < TOTAL_MONTHS_IN_YEAR; currentMonthIndex++) {
      monthlyFigures = processedLines[currentInputLineIndex++].split(' ').map(Number);

      const monthlyNetChange = monthlyFigures[0] - monthlyFigures[1];
      loanBalance -= monthlyNetChange;

      if (solutionFoundForScenario) {
        if (loanBalance <= 0) {
          console.log(currentMonthIndex + 1);
          solutionFoundForScenario = false;
        }
      }
    }

    if (solutionFoundForScenario) {
      console.log('NA');
    }
  }
}

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(dataSegment) {
  rawInputBuffer += dataSegment;
});
process.stdin.on('end', function() {
  const linesArray = rawInputBuffer.split('\n');
  processLoanScenarios(linesArray);
});
