function processData(rawData) {
    const lineSegments = rawData.split("\n");

    const [itemCountIdentifier, thresholdValueIdentifier] = lineSegments[0].split(" ");
    const limitForProcessing = Number(itemCountIdentifier);
    const comparisonBoundary = Number(thresholdValueIdentifier);

    const numericSequence = lineSegments[1].split(" ").map(Number);

    const relevantNumericSubset = numericSequence.slice(0, limitForProcessing);

    const matchingElements = relevantNumericSubset.filter(currentElement => currentElement >= comparisonBoundary);
    const finalTally = matchingElements.length;

    console.log(finalTally);
}

processData(require('fs').readFileSync('/dev/stdin', 'utf8'));
