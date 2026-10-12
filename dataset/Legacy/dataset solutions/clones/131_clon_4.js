function processInputData() {
    const processedLines = accumulatedInputString
        .split('\n')
        .map(l => l.trim())
        .filter(Boolean);

    const tally = processedLines.reduce((accumulator, currentLineSegment) => {
        const numericalComponents = currentLineSegment.split(',').map(Number);
        const [firstVal, secondVal, thirdVal] = numericalComponents;

        const isPythagoreanRelationship = Math.hypot(firstVal, secondVal) === thirdVal;
        const areFirstTwoIdentical = firstVal === secondVal;

        return {
            firstCounter: accumulator.firstCounter + (isPythagoreanRelationship ? 1 : 0),
            secondCounter: accumulator.secondCounter + (!isPythagoreanRelationship && areFirstTwoIdentical ? 1 : 0)
        };
    }, { firstCounter: 0, secondCounter: 0 });

    console.log('%d\n%d', tally.firstCounter, tally.secondCounter);
}

let accumulatedInputString = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', (dataChunk) => {
    accumulatedInputString += dataChunk;
});
process.stdin.on('end', () => {
    processInputData();
});
