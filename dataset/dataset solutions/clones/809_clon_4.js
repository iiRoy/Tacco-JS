var outputWriter = console.log;
if (typeof process != "undefined") {
    var rawInputBuffer = "";
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function (chunk) {
        rawInputBuffer += chunk;
    });
    process.stdin.on('end', function () {
        processInput(rawInputBuffer);
    });
}

function processInput(fullText) {
    var textRows = fullText.split("\n");
    textRows.shift();
    textRows.pop();
    processDataSets(textRows);
}

function processDataSets(initialRows) {
    initialRows.splice(0, 1);

    const numericDataCollections = initialRows.map(lineContent =>
        Array.from(lineContent.split(" "), Number)
    );

    const pairedCollections = Array.from(
        { length: Math.floor(numericDataCollections.length / 2) },
        (_, index) => [numericDataCollections[2 * index], numericDataCollections[2 * index + 1]]
    );

    const computedResults = pairedCollections.map(currentPair => {
        const powerThreshold = currentPair[0].at(1);
        const sequenceValues = currentPair[1];

        const sequentialDifferences = sequenceValues.slice(1).map((currentVal, idx) =>
            currentVal - sequenceValues[idx]
        );

        sequentialDifferences.sort((valA, valB) => valB - valA);

        const filteredDifferences = sequentialDifferences.slice(powerThreshold - 1);

        const totalDifferenceSum = filteredDifferences.reduce((accumulator, currentDiff) =>
            accumulator + currentDiff, 0
        );

        return totalDifferenceSum;
    });

    computedResults.forEach(result => outputWriter(result));
}
