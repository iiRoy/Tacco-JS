const resolveValue = (currentElement, lowerBoundMedian, upperBoundMedian) => {
    return currentElement <= lowerBoundMedian ? upperBoundMedian : lowerBoundMedian;
};

const processInputData = (rawData) => {
    const [countString, numbersString] = rawData.trim().split('\n');
    const totalElementCount = Number(countString);
    const initialNumericValues = numbersString.split(' ').map(Number);

    const sortedNumericValues = [...initialNumericValues].sort((valA, valB) => valA - valB);

    const firstMidpointValue = sortedNumericValues[totalElementCount / 2 - 1];
    const secondMidpointValue = sortedNumericValues[totalElementCount / 2];

    const resultLines = initialNumericValues.map(val =>
        resolveValue(val, firstMidpointValue, secondMidpointValue)
    );

    console.log(resultLines.join('\n'));
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
