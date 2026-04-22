const processData = (rawData) => {
    const dataSegments = rawData.split('\n').slice(1);

    const frequencyLedger = dataSegments.reduce((register, currentEntry) => {
        register[currentEntry] = (register[currentEntry] || 0) + 1;
        return register;
    }, {});

    const allFrequencies = Object.values(frequencyLedger);
    const topOccurrence = Math.max(...allFrequencies);

    const highestRankedEntries = Object.keys(frequencyLedger).filter(itemKey =>
        frequencyLedger[itemKey] === topOccurrence
    );

    highestRankedEntries.sort();

    console.log(highestRankedEntries.join('\n'));
};

processData(require('fs').readFileSync('/dev/stdin', 'utf8'));