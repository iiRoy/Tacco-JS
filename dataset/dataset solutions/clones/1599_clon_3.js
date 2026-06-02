function processInput(rawData) {
    const lines = rawData.split("\n");
    const numElements = parseInt(lines[0], 10);
    const lengthsArray = lines[1].split(" ").map(valStr => parseInt(valStr, 10));

    let validTriangleCount = 0;

    for(let idx1 = 0; idx1 < numElements; idx1++) {
        const currentSideA = lengthsArray[idx1];
        for(let idx2 = idx1 + 1; idx2 < numElements; idx2++) {
            const currentSideB = lengthsArray[idx2];
            for(let idx3 = idx2 + 1; idx3 < numElements; idx3++) {
                const currentSideC = lengthsArray[idx3];

                const areSidesDistinct = areAllDistinct(currentSideA, currentSideB, currentSideC);
                if (!areSidesDistinct) {
                    continue;
                }

                const formsValidTriangle = canFormTriangle(currentSideA, currentSideB, currentSideC);
                if (formsValidTriangle) {
                    validTriangleCount++;
                }
            }
        }
    }

    console.log(validTriangleCount);
}

function areAllDistinct(sideA, sideB, sideC) {
    const distinctAandB = sideA !== sideB;
    const distinctAandC = sideA !== sideC;
    const distinctBandC = sideB !== sideC;
    return distinctAandB && distinctAandC && distinctBandC;
}

function canFormTriangle(sideA, sideB, sideC) {
    const conditionOne = sideA + sideB > sideC;
    const conditionTwo = sideB + sideC > sideA;
    const conditionThree = sideC + sideA > sideB;
    return conditionOne && conditionTwo && conditionThree;
}
 
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
