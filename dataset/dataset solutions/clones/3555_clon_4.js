function calculateDivisor(valA, valB) {
    while (valB !== 0) {
        let tempHolder = valB;
        valB = valA % valB;
        valA = tempHolder;
    }
    return valA;
}

function findCommonFactorForSet(numericSet) {
    if (numericSet.length === 0) {
        return 0;
    }
    return numericSet.reduce((accumulator, currentElement) => calculateDivisor(accumulator, currentElement));
}

function ProcessInput(entryData) {
    const allNumericValues = entryData.split(/\s+/).filter(Boolean).map(Number);

    const pivotValue = allNumericValues[1];
    const coordinatePoints = allNumericValues.slice(2);

    let deltaMagnitudes;
    if (coordinatePoints.length === 0) {
        deltaMagnitudes = [Math.abs(pivotValue - 0)];
    } else {
        deltaMagnitudes = coordinatePoints.map(itemVal => Math.abs(pivotValue - itemVal));
    }

    console.log(findCommonFactorForSet(deltaMagnitudes));
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));