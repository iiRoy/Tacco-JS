process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(inputChunk) {
    const inputLines = inputChunk.toString().split('\n');
    const numericalLimit = parseInt(inputLines[0], 10);

    function* generateSequence(upperBound) {
        let currentVal = 1;
        while (currentVal <= upperBound) {
            yield currentVal;
            currentVal++;
        }
    }

    function assessValue(candidateNumber) {
        const conditionChecks = [
            (num) => num % 3 === 0,
            (num) => String(num).endsWith('3'),
            (num) => num === 30,
            (num) => num % 10 === 0 && (num / 10) % 10 === 3
        ];
        return conditionChecks.some(testFunc => testFunc(candidateNumber));
    }

    const collectedValues = [];
    const sequenceIterator = generateSequence(numericalLimit);

    for (const item of sequenceIterator) {
        if (assessValue(item)) {
            collectedValues.push(item);
        }
    }

    const outputString = collectedValues.join(' ');

    if (outputString) {
        console.log('', outputString);
    } else {
        console.log();
    }
});
