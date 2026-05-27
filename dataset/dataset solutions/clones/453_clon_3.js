process.stdin.resume();
process.stdin.setEncoding('utf8');
var rawData = '';
process.stdin.on('data', function (chunk) {
  rawData += chunk;
});
process.stdin.on('end', function () {
  var dataLines = rawData.split('\n');
  var currentLinePointer = 0;

  function processLoanScenario(linesArray, pointer) {
    var totalMonthsInYear = 12;
    var initialLoanAmount = parseInt(linesArray[pointer++]);

    if (initialLoanAmount === 0) {
      return { result: null, newPointer: pointer };
    }

    var monthlyResult = 'NA';
    var remainingLoan = initialLoanAmount;

    for (var monthIdx = 0; monthIdx < totalMonthsInYear; monthIdx++) {
      var monthData = linesArray[pointer++].split(' ');
      var monthlyIncome = parseInt(monthData[0]);
      var monthlyExpense = parseInt(monthData[1]);

      var netMonthlyChange = monthlyIncome - monthlyExpense;
      remainingLoan -= netMonthlyChange;

      if (monthlyResult === 'NA' && remainingLoan <= 0) {
        monthlyResult = monthIdx + 1;
      }
    }
    return { result: monthlyResult, newPointer: pointer };
  }

  while (true) {
    var scenarioOutcome = processLoanScenario(dataLines, currentLinePointer);
    if (scenarioOutcome.result === null) {
      break;
    }
    console.log(scenarioOutcome.result);
    currentLinePointer = scenarioOutcome.newPointer;
  }
});
