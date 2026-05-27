function processInputData(inputString) {
    const allLines = inputString.split("\n");
    const numCases = parseInt(allLines[0], 10);

    const outcomeTypes = ["AC", "WA", "TLE", "RE"];

    const initialCounts = new Map(outcomeTypes.map(type => [type, 0]));

    const finalCounts = allLines.slice(1, numCases + 1).reduce((accumulatorMap, currentOutcome) => {
        accumulatorMap.set(currentOutcome, (accumulatorMap.get(currentOutcome) || 0) + 1);
        return accumulatorMap;
    }, initialCounts);

    outcomeTypes.forEach(typeKey => {
        console.log(`${typeKey} x ${finalCounts.get(typeKey)}`);
    });
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
