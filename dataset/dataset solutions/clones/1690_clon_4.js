function analyzeOutcomeStats(rawText) {
    const allLines = rawText.trim().split('\n');
    const totalEntries = parseInt(allLines[0], 10);

    const dataEntries = allLines.slice(1, 1 + totalEntries);

    const outcomeTally = dataEntries.reduce((accumulatorMap, currentOutcome) => {
        accumulatorMap.set(currentOutcome, (accumulatorMap.get(currentOutcome) || 0) + 1);
        return accumulatorMap;
    }, new Map());

    const reportOrder = ["AC", "WA", "TLE", "RE"];

    reportOrder.forEach(category => {
        console.log(`${category} x ${outcomeTally.get(category) || 0}`);
    });
}

analyzeOutcomeStats(require("fs").readFileSync("/dev/stdin", "utf8"));