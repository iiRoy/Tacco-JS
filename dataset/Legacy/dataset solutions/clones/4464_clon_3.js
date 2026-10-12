function processInputData(rawData) {
    let lineData = rawData.split("\n");
    let firstValues = [];
    let secondValues = [];
    let allNumbersCollected = [];

    const parseLine = (lineContent) => {
        const tempParts = lineContent.split(" ");
        const valA = Number(tempParts[0]);
        const valB = Number(tempParts[1]);
        return { valA, valB };
    };

    for (let lineIndex = 0; lineIndex < lineData.length; lineIndex++) {
        const { valA, valB } = parseLine(lineData[lineIndex]);
        firstValues.push(valA);
        secondValues.push(valB);
        allNumbersCollected.push(valA, valB);
    }

    const currentMaxValue = Math.max(...allNumbersCollected);

    const findAllIndices = (sourceArray, targetValue) => {
        const foundIndices = [];
        let searchStartIndex = -1;
        while ((searchStartIndex = sourceArray.indexOf(targetValue, searchStartIndex + 1)) !== -1) {
            foundIndices.push(searchStartIndex);
        }
        return foundIndices;
    };

    const startingOneIndices = findAllIndices(firstValues, 1);

    if (startingOneIndices.length === 0) {
        console.log("IMPOSSIBLE");
        return;
    }

    for (const currentFirstIndex of startingOneIndices) {
        const requiredNextValue = secondValues[currentFirstIndex];
        const nextMatchingIndices = findAllIndices(firstValues, requiredNextValue);

        for (const nextFirstIndex of nextMatchingIndices) {
            if (secondValues[nextFirstIndex] === currentMaxValue) {
                console.log("POSSIBLE");
                return;
            }
        }
    }

    console.log("IMPOSSIBLE");
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
