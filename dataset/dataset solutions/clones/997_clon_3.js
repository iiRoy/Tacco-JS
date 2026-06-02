(function(inputContent) {
    const convertToNumber = (str) => Number(str);

    const rawLines = inputContent.split('\n');

    const processedNumbers = [];
    for (let lineIndex = 0; lineIndex < rawLines.length; lineIndex++) {
        processedNumbers.push(convertToNumber(rawLines[lineIndex]));
    }

    const initialCount = processedNumbers.shift();
    const valueSequence = processedNumbers.slice(0, initialCount);

    let greatestDifference = Number.NEGATIVE_INFINITY;

    const sequenceLength = valueSequence.length;

    for (let firstIndex = 0; firstIndex < sequenceLength; firstIndex++) {
        const firstValue = valueSequence[firstIndex];

        for (let secondIndex = firstIndex + 1; secondIndex < sequenceLength; secondIndex++) {
            const secondValue = valueSequence[secondIndex];
            const currentCalculatedDifference = secondValue - firstValue;
            greatestDifference = Math.max(greatestDifference, currentCalculatedDifference);
        }
    }

    console.log(greatestDifference);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
