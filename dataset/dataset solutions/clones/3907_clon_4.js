process.stdin.resume();
process.stdin.setEncoding('utf8');
let inputBuffer = '';

process.stdin.on('data', function(chunk) {
    inputBuffer += chunk;
});

process.stdin.on('end', function() {
    const inputLines = inputBuffer.split('\n');
    const dataElementsString = inputLines[1].split(' ');

    const originalNumbers = dataElementsString.map(numericString => parseInt(numericString, 10));
    const totalElementCount = originalNumbers.length;

    const orderedNumbers = [...originalNumbers].sort((first, second) => first - second);

    const valueToSortedIndices = orderedNumbers.reduce((accumulator, currentVal, currentIndex) => {
        if (!accumulator.has(currentVal)) {
            accumulator.set(currentVal, []);
        }
        accumulator.get(currentVal).push(currentIndex);
        return accumulator;
    }, new Map());

    const adjustedTotalCount = totalElementCount - 1;
    const medianSplitPoint = Math.floor(adjustedTotalCount / 2);

    const lowerMedianCandidate = orderedNumbers[medianSplitPoint];
    const upperMedianCandidate = orderedNumbers[medianSplitPoint + 1];

    const computedResults = originalNumbers.map(currentOriginalValue => {
        const consumedSortedPosition = valueToSortedIndices.get(currentOriginalValue).pop();

        return (consumedSortedPosition <= medianSplitPoint) ? upperMedianCandidate : lowerMedianCandidate;
    });

    computedResults.forEach(finalResult => {
        console.log(finalResult.toString());
    });
});
