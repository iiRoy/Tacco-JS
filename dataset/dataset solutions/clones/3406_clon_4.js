function main(sourceText) {
    const processedLines = sourceText.split('\n');

    // Separate the first element (which is effectively discarded from the main list)
    // and parse the rest into numbers.
    // This replaces input.split().map().shift()
    const numericData = processedLines.reduce((accumulator, currentLine, index) => {
        const parsedValue = parseInt(currentLine, 10);
        if (index === 0) {
            // The first value is read but not used in the subsequent array operations.
            // We store it here to acknowledge its parsing, but it's not part of the 'numbers' array.
            accumulator.initialElement = parsedValue;
        } else {
            accumulator.numbers.push(parsedValue);
        }
        return accumulator;
    }, { initialElement: 0, numbers: [] });

    const numberSequence = numericData.numbers;

    // Find the maximum value and its first occurrence index in a single pass.
    // This replaces Math.max.apply() and indexOf().
    const extremeValueInfo = numberSequence.reduce((acc, currentVal, currentIndex) => {
        if (currentVal > acc.peakValue) {
            acc.peakValue = currentVal;
            acc.peakIndex = currentIndex;
        }
        return acc;
    }, { peakValue: -Infinity, peakIndex: -1 });

    // Create a new array where the element at the peak index is halved.
    // This replaces in-place modification input[maxIndex] = ...
    const adjustedSequence = numberSequence.map((val, idx) => {
        if (idx === extremeValueInfo.peakIndex) {
            return val / 2;
        }
        return val;
    });

    // Calculate the sum of all elements in the adjusted sequence.
    // This replaces the reduce method for summation.
    let totalSum = 0;
    for (const item of adjustedSequence) {
        totalSum += item;
    }

    console.log(totalSum);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
