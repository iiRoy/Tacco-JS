const dataStream = require('fs').readFileSync('/dev/stdin', 'utf8');

function* lineProducer(sourceText) {
    const lines = sourceText.trim().split('\n');
    let currentIndex = 0;
    while (currentIndex < lines.length) {
        yield lines[currentIndex++];
    }
}

function calculateFrequencies(sourceArray) {
    const sumCounts = new Map();
    const prefixSums = [0];
    let currentAccumulation = 0;
    for (const valueElement of sourceArray) {
        currentAccumulation += valueElement;
        prefixSums.push(currentAccumulation);
    }

    for (let startPosition = 0; startPosition < sourceArray.length; startPosition++) {
        for (let endPosition = startPosition; endPosition < sourceArray.length; endPosition++) {
            const segmentSum = prefixSums[endPosition + 1] - prefixSums[startPosition];
            sumCounts.set(segmentSum, (sumCounts.get(segmentSum) || 0) + 1);
        }
    }
    return sumCounts;
}

const inputLineIterator = lineProducer(dataStream);

for (const currentInputLine of inputLineIterator) {
    if (currentInputLine === "0 0") {
        break;
    }

    const dimensions = currentInputLine.split(' ').map(Number);
    const heightQuantity = dimensions[0];
    const widthQuantity = dimensions[1];

    const heightsArray = Array.from({ length: heightQuantity }, () => Number(inputLineIterator.next().value));
    const widthsArray = Array.from({ length: widthQuantity }, () => Number(inputLineIterator.next().value));

    const heightSumFrequencies = calculateFrequencies(heightsArray);
    const widthSumFrequencies = calculateFrequencies(widthsArray);

    let totalMatches = 0;

    for (const [sumValue, hFrequency] of heightSumFrequencies.entries()) {
        if (widthSumFrequencies.has(sumValue)) {
            totalMatches += hFrequency * widthSumFrequencies.get(sumValue);
        }
    }

    console.log(totalMatches);
}
