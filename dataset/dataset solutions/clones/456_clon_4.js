var input = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
  input += chunk;
});
process.stdin.on('end', function() {
  const allInputLines = input.split('\n');
  const processedScenarios = parseInputData(allInputLines);
  processedScenarios.forEach(singleScenario => {
    console.log(evaluateScenario(singleScenario));
  });
});

const parseInputData = (linesCollection) => {
    const structuredScenarios = [];
    let currentLinePointer = 0;
    while (true) {
        const initialBalanceValue = Number(linesCollection[currentLinePointer++]);
        if (initialBalanceValue === 0) break;

        const monthlyTransactionRecords = Array.from({ length: 12 }, () => {
            return linesCollection[currentLinePointer++].split(' ').map(Number);
        });
        structuredScenarios.push({ startingAmount: initialBalanceValue, monthlyOperations: monthlyTransactionRecords });
    }
    return structuredScenarios;
};

const evaluateScenario = (scenarioDetails) => {
    const finalOutcome = scenarioDetails.monthlyOperations.reduce((tracker, [outflow, inflow], monthIndex) => {
        if (tracker.breachMonth !== null) {
            return tracker;
        }
        const netDifference = outflow - inflow;
        tracker.currentAccountValue -= netDifference;
        if (tracker.currentAccountValue <= 0) {
            tracker.breachMonth = monthIndex + 1;
        }
        return tracker;
    }, { currentAccountValue: scenarioDetails.startingAmount, breachMonth: null });

    return finalOutcome.breachMonth !== null ? String(finalOutcome.breachMonth) : 'NA';
};
