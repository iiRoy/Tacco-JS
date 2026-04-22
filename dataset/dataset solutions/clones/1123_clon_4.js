const outputWriter = console.log;

if (typeof process !== "undefined") {
    let inputAccumulator = "";
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function(chunk) {
        inputAccumulator += chunk;
    });
    process.stdin.on('end', function() {
        const inputSections = inputAccumulator.split("\n");
        processInputAndCompute(inputSections);
    });
}

function processInputAndCompute(rawTextLines) {
    const numericalRowData = rawTextLines.map(function(lineContent) {
        return lineContent.split(/\s+/).filter(Boolean).map(Number);
    }).filter(row => row.length > 0);

    numericalRowData.shift();

    const polygonBoundaryPoints = numericalRowData;

    let totalSignedAreaSum = 0;
    const boundaryPointCount = polygonBoundaryPoints.length;

    totalSignedAreaSum = polygonBoundaryPoints.reduce((accumulatedValue, currentCoordinatePair, currentIdx) => {
        const nextIdx = (currentIdx + 1) % boundaryPointCount;
        const nextCoordinatePair = polygonBoundaryPoints[nextIdx];

        // This term is (x_i * y_{i+1}) - (x_{i+1} * y_i)
        return accumulatedValue + (currentCoordinatePair[0] * nextCoordinatePair[1] - nextCoordinatePair[0] * currentCoordinatePair[1]);
    }, 0);

    const calculatedGeometricSpace = totalSignedAreaSum / 2;

    const preciseTruncation = Math.trunc(calculatedGeometricSpace * 10) / 10;
    const formattedOutputString = preciseTruncation.toFixed(1);

    outputWriter(formattedOutputString);
}