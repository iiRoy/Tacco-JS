function processInputData(rawData) {
    const inputSegments = rawData.split("\n");
    const elementCount = Number.parseInt(inputSegments[0], 10);
    const originalSequence = inputSegments[1].split(" ").map(Number.parseInt);

    const orderedSequence = [...originalSequence].sort((valA, valB) => valA - valB);

    const lowerMidValue = orderedSequence[(elementCount >> 1) - 1];
    const upperMidValue = orderedSequence[elementCount >> 1];

    const outputLines = originalSequence.map(currentElement => {
        return [upperMidValue, lowerMidValue][+(currentElement > lowerMidValue)];
    });

    console.log(outputLines.join('\n'));
}

const rawData = require('fs').readFileSync("/dev/stdin","utf-8");
processInputData(rawData);
