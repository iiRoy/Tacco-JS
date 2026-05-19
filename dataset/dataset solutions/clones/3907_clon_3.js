process.stdin.resume();
process.stdin.setEncoding('utf8');

let inputAccumulator = '';

process.stdin.on('data', (dataChunk) => {
    inputAccumulator += dataChunk;
});

process.stdin.on('end', () => {
    const rawInputLines = inputAccumulator.split('\n');

    const parseInputData = (linesArray) => {
        const totalElementsCount = Number(linesArray[0]);
        const elementsAsString = linesArray[1].split(' ');
        const numericElements = elementsAsString.map(Number);

        return { totalElementsCount, numericElements };
    };

    const { totalElementsCount, numericElements } = parseInputData(rawInputLines);

    const sortedNumericElements = [...numericElements].sort((a, b) => a - b);

    const sortedValueToIndicesMap = new Map();
    sortedNumericElements.forEach((val, idx) => {
        if (!sortedValueToIndicesMap.has(val)) {
            sortedValueToIndicesMap.set(val, []);
        }
        sortedValueToIndicesMap.get(val).push(idx);
    });

    const N = totalElementsCount;
    const effectiveLengthForMedian = N - 1;

    const medianLowerBoundIdx = Math.floor(effectiveLengthForMedian / 2);
    const lowerMedianCandidate = sortedNumericElements[medianLowerBoundIdx];
    const upperMedianCandidate = sortedNumericElements[medianLowerBoundIdx + 1];

    for (let k = 0; k < N; k++) {
        const currentOriginalNumber = numericElements[k];

        const sortedPositionOfCurrent = sortedValueToIndicesMap.get(currentOriginalNumber).pop();

        let outputValue;
        if (sortedPositionOfCurrent <= medianLowerBoundIdx) {
            outputValue = upperMedianCandidate;
        } else {
            outputValue = lowerMedianCandidate;
        }
        console.log(String(outputValue));
    }
});
