const lineReader = require('readline');

const inputStreamHandler = lineReader.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

let accumulatedNumericData = [];

inputStreamHandler.on('line', (dataSegment) => {
    accumulatedNumericData.push(Number(dataSegment));
});

const calculateGeometricSurface = (baseDimension, verticalElevation) => {
    const baseSurfaceArea = Math.pow(baseDimension, 2);
    const slantHypotenuseTerm = Math.sqrt(4 * Math.pow(verticalElevation, 2) + Math.pow(baseDimension, 2));
    const lateralSurfaceAreaComponent = baseDimension * slantHypotenuseTerm;
    return baseSurfaceArea + lateralSurfaceAreaComponent;
};

const processSequenceRecursively = (dataList, currentPosition) => {
    if (currentPosition + 1 >= dataList.length) {
        return; // Not enough data for a pair
    }

    const firstComponent = dataList[currentPosition];
    const secondComponent = dataList[currentPosition + 1];

    if (firstComponent === 0 && secondComponent === 0) {
        return; // Termination signal detected
    }

    const resultantValue = calculateGeometricSurface(firstComponent, secondComponent);
    process.stdout.write(resultantValue.toFixed(6) + '\n');

    // Advance to the next pair
    processSequenceRecursively(dataList, currentPosition + 2);
};

inputStreamHandler.on('close', () => {
    processSequenceRecursively(accumulatedNumericData, 0);
});