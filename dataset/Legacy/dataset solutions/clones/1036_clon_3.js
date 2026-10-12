function processInputData(rawData) {
    const inputLines = rawData.split("\n");

    const arraySizeN = parseInt(inputLines[0], 10);
    const queryCountQ = parseInt(inputLines[2], 10);

    const parseNumericValue = (str) => parseInt(str, 10);

    const sourceStringElements = inputLines[1].split(" ");
    const queryStringTargets = inputLines[3].split(" ");

    const sourceElements = sourceStringElements.map(parseNumericValue);
    const queryTargets = queryStringTargets.map(parseNumericValue);

    let totalMatches = 0;

    const areValuesEqual = (valA, valB) => valA === valB;

    for (let currentSourceIndex = 0; currentSourceIndex < arraySizeN; currentSourceIndex++) {
        const currentSourceValue = sourceElements[currentSourceIndex];
        for (let currentTargetIndex = 0; currentTargetIndex < queryCountQ; currentTargetIndex++) {
            const currentTargetValue = queryTargets[currentTargetIndex];
            const isMatch = areValuesEqual(currentSourceValue, currentTargetValue);
            if (isMatch) {
                totalMatches++;
            }
        }
    }

    console.log(totalMatches);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
