function processInputData(rawData) {
    const outcomeTypes = ["AC", "WA", "TLE", "RE"];
    const tallyMap = new Map(outcomeTypes.map(type => [type, 0]));

    const allSegments = rawData.split('\n').filter(Boolean); // Split by newline and remove any resulting empty strings
    const eventLogEntries = allSegments.slice(1); // Discard the first line (which is just a count)

    eventLogEntries.forEach(entry => {
        if (tallyMap.has(entry)) {
            tallyMap.set(entry, tallyMap.get(entry) + 1);
        }
    });

    const displayResults = outcomeTypes.map(type => {
        return `${type} x ${tallyMap.get(type)}`;
    });

    console.log(displayResults.join('\n'));
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));