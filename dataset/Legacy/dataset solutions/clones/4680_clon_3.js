function parseNumericInputs(inputString) {
    const parts = inputString.split(" ");
    return {
        widthValue: parseInt(parts[0]),
        coordA: parseInt(parts[1]),
        coordB: parseInt(parts[2])
    };
}

function calculateIntervalDistance(width, posA, posB) {
    const rightBoundaryA = posA + width;
    const rightBoundaryB = posB + width;

    let currentDistance;

    if (posB > rightBoundaryA) {
        currentDistance = posB - rightBoundaryA;
    } else if (posA > rightBoundaryB) {
        currentDistance = posA - rightBoundaryB;
    } else {
        currentDistance = 0;
    }
    return currentDistance;
}

function mainProcessor(rawInputData) {
    const { widthValue, coordA, coordB } = parseNumericInputs(rawInputData);

    const resultDistance = calculateIntervalDistance(widthValue, coordA, coordB);

    console.log(resultDistance);
}

mainProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));process.stdin.resume();
