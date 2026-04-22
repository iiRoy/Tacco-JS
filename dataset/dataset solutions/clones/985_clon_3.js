process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', (incomingDataBuffer) => {
    const rawInputLines = String(incomingDataBuffer).split(/\r?\n/);

    if (rawInputLines.length < 2) {
        console.error("Error: Insufficient input lines provided.");
        return;
    }

    const expectedElementCount = parseInt(rawInputLines[0].trim(), 10);

    if (isNaN(expectedElementCount) || expectedElementCount <= 0) {
        console.error("Error: Invalid or non-positive element count specified.");
        return;
    }

    let numericDataCollection = rawInputLines[1].split(/\s+/).filter(Boolean).map(Number);

    if (numericDataCollection.length !== expectedElementCount) {
        console.error(`Warning: Expected ${expectedElementCount} elements but found ${numericDataCollection.length}.`);
    }

    const renderArrayState = (arr) => arr.join(' ');

    console.log(renderArrayState(numericDataCollection));

    for (let currentPosition = 1; currentPosition < expectedElementCount; ++currentPosition) {
        const valueToPlace = numericDataCollection[currentPosition];
        let comparisonPointer = currentPosition - 1;

        while (comparisonPointer >= 0 && numericDataCollection[comparisonPointer] > valueToPlace) {
            const elementBeingShifted = numericDataCollection[comparisonPointer];
            numericDataCollection[comparisonPointer + 1] = elementBeingShifted;
            --comparisonPointer;
        }

        numericDataCollection[comparisonPointer + 1] = valueToPlace;

        console.log(renderArrayState(numericDataCollection));
    }
});