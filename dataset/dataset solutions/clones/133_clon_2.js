var rawInputBuffer = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function (dataSegment) {
    rawInputBuffer += dataSegment;
});

process.stdin.on('end', function () {
    rawInputBuffer = rawInputBuffer.split('\n');
    executeProcessing();
});

function executeProcessing() {

    function explorePossibilities(
        currentSequence,
        leftPile,
        rightPile
    ) {
        if (currentSequence.length === 0) {
            return true;
        }

        return (currentSequence[0] > leftPile[0] &&
                explorePossibilities(
                    currentSequence.slice(1),
                    [currentSequence[0]].concat(leftPile),
                    rightPile
                )) ||
               (currentSequence[0] > rightPile[0] &&
                explorePossibilities(
                    currentSequence.slice(1),
                    leftPile,
                    [currentSequence[0]].concat(rightPile)
                ));
    }

    let iterationIndex;
    const numberOfTestCases = Number.parseInt(rawInputBuffer[0], 10);
    const inputNumberArrays = rawInputBuffer.slice(1);

    for (iterationIndex = 0; iterationIndex < numberOfTestCases; iterationIndex++) {
        const currentTestCaseNumbers = inputNumberArrays[iterationIndex]
            .split(' ')
            .map(Number.parseFloat);

        const outcome = explorePossibilities(currentTestCaseNumbers, [0], [0]);
        console.log(outcome ? 'YES' : 'NO');
    }
}