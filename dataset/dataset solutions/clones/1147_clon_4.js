function processInput(dataSource) {
    const lineData = dataSource.split('\n');
    const firstSequence = lineData[0];
    const secondSequence = lineData[1];

    const lenA = firstSequence.length;
    const lenB = secondSequence.length;

    const distanceMap = new Map();

    function obtainMetric(currentA, currentB) {
        const keyIdentifier = `${currentA},${currentB}`;
        if (distanceMap.has(keyIdentifier)) {
            return distanceMap.get(keyIdentifier);
        }

        if (currentA === 0) {
            return currentB;
        }
        if (currentB === 0) {
            return currentA;
        }

        const substitutionCost = (firstSequence[currentA - 1] === secondSequence[currentB - 1]) ? 0 : 1;

        const deletionResult = obtainMetric(currentA - 1, currentB) + 1;
        const insertionResult = obtainMetric(currentA, currentB - 1) + 1;
        const replaceResult = obtainMetric(currentA - 1, currentB - 1) + substitutionCost;

        const minimumValue = Math.min(deletionResult, insertionResult, replaceResult);

        distanceMap.set(keyIdentifier, minimumValue);
        return minimumValue;
    }

    const finalMeasure = obtainMetric(lenA, lenB);
    console.log(finalMeasure);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));