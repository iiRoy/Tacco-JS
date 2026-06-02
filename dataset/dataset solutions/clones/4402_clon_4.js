function processInputData(sourceContent) {
    const lineSegments = sourceContent.split('\n');
    const tokenStrings = lineSegments[1].split(' ');
    const numericalSequence = tokenStrings.map(Number);

    const occurrenceMap = numericalSequence.reduce((accumulator, currentElement) => {
        accumulator.set(currentElement, (accumulator.get(currentElement) || 0) + 1);
        return accumulator;
    }, new Map());

    const pairedElements = Array.from(occurrenceMap.entries())
        .filter(([elementValue, elementCount]) => elementCount % 2 === 0)
        .map(([elementValue, elementCount]) => elementValue)
        .sort((a, b) => b - a);

    const topValue = pairedElements[0] || 0;
    const nextValue = pairedElements[1] || 0;

    console.log(topValue * nextValue);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
