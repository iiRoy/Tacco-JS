const outputWriter = console.log;

const runtimeHandle = typeof process !== "undefined" ? process : null;

if (runtimeHandle) {
    let accumulatedContent = "";
    runtimeHandle.stdin.resume();
    runtimeHandle.stdin.setEncoding('utf8');
    runtimeHandle.stdin.on('data', (segment) => {
        accumulatedContent += segment;
    });
    runtimeHandle.stdin.on('end', () => {
        initiateProcessing(accumulatedContent);
    });
}

function initiateProcessing(fullText) {
    const allTextRows = fullText.split("\n");

    const effectiveTextRows = allTextRows.slice(1, -1);

    performCalculations(effectiveTextRows);
}

function performCalculations(inputSegments) {
    const actualDataSegments = inputSegments.slice(1);

    const numericDataUnits = actualDataSegments.map(segment =>
        segment.split(" ").map(Number)
    );

    const groupedDataSets = numericDataUnits.reduce((accumulator, currentUnit, index, fullArray) => {
        if (index % 2 === 0 && fullArray[index + 1]) {
            accumulator.push([currentUnit, fullArray[index + 1]]);
        }
        return accumulator;
    }, []);

    groupedDataSets.forEach(currentDataSet => {
        const powerFactor = currentDataSet[0][1];

        const valueSequence = currentDataSet[1];

        const differenceArray = valueSequence.slice(1).map((currentVal, idx) =>
            currentVal - valueSequence[idx]
        );

        differenceArray.sort((valA, valB) => valB - valA);

        const remainingDifferences = differenceArray.slice(powerFactor - 1);

        const finalSum = remainingDifferences.reduce((acc, val) => acc + val, 0);

        outputWriter(finalSum);
    });
}