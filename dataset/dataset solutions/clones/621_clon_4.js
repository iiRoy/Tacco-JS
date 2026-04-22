let accumulatedInputData = '';

process.stdin.setEncoding('utf8');

process.stdin.on('data', (chunkBuffer) => {
    accumulatedInputData += chunkBuffer;
});

process.stdin.on('end', () => {
    const rawInputSegments = accumulatedInputData.trim().split('\n');

    const [countHeaderInfo, ...remainingDataSegments] = rawInputSegments;
    const itemsToProcessCount = parseInt(countHeaderInfo, 10);

    // Construct an array that precisely matches the number of items indicated by the header,
    // potentially containing 'undefined' entries if the actual data is shorter.
    const relevantInputItems = Array.from({ length: itemsToProcessCount }, (_, index) => remainingDataSegments[index]);

    const aggregateMap = relevantInputItems.reduce((currentLedger, itemLine) => {
        // This will throw if itemLine is undefined, mimicking the original behavior
        // when 'AL' is greater than the actual number of data lines.
        const itemComponents = itemLine.split(' ');
        const uniqueKey = itemComponents[0];
        const associatedValue = +itemComponents[1]; // Convert string to number

        currentLedger.set(uniqueKey, (currentLedger.get(uniqueKey) || 0) + associatedValue);
        return currentLedger;
    }, new Map());

    const sortedLabels = Array.from(aggregateMap.keys());

    sortedLabels.sort((primaryEntry, secondaryEntry) => {
        const lengthSortDifference = primaryEntry.length - secondaryEntry.length;
        if (lengthSortDifference !== 0) {
            return lengthSortDifference; // Sort by length primarily
        }
        return primaryEntry.localeCompare(secondaryEntry); // Then alphabetically for same length
    });

    const resultantOutput = sortedLabels.map(label => 
        `${label} ${aggregateMap.get(label)}`
    ).join('\n');

    process.stdout.write(resultantOutput);
});

// Ensure the process remains active to receive all input
process.stdin.resume();