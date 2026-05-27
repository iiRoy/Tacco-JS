const os = require('os');

async function orchestrateExecution(mainLogicFunction) {
    const inputChunks = [];
    process.stdin.on('data', (chunk) => inputChunks.push(chunk));
    await new Promise((resolve) => process.stdin.on('end', resolve));
    const fullInputContent = inputChunks.join('');
    const allInputTokens = fullInputContent.split(/\s+/).filter(Boolean);

    function outputWriter(contentToPrint, endCharacter) {
        process.stdout.write(contentToPrint + (endCharacter === undefined ? os.EOL : endCharacter));
    }

    mainLogicFunction(allInputTokens, outputWriter);
}

function calculatePathVariations(inputDataSegments, printOutput) {
    let dataCursor = 0;
    const segmentCount = Number(inputDataSegments[dataCursor++]);
    const coordinateValues = [];
    for (let k = 0; k < segmentCount; ++k) {
        coordinateValues.push(Number(inputDataSegments[dataCursor++]));
    }

    const fullPathPoints = [0, ...coordinateValues, 0];

    const initialTotalDistance = fullPathPoints.slice(0, -1).reduce((accumulator, currentPoint, index) => {
        const nextPoint = fullPathPoints[index + 1];
        return accumulator + Math.abs(currentPoint - nextPoint);
    }, 0);

    const resultSegments = Array.from({ length: segmentCount }, (_, index) => {
        const firstPoint = fullPathPoints[index];
        const intermediatePoint = fullPathPoints[index + 1];
        const lastPoint = fullPathPoints[index + 2];

        // This calculation is equivalent to:
        // initialTotalDistance - (|firstPoint - intermediatePoint| + |intermediatePoint - lastPoint|) + |firstPoint - lastPoint|
        // Which effectively removes the intermediatePoint from the path calculation.
        return initialTotalDistance - (Math.abs(firstPoint - intermediatePoint) + Math.abs(intermediatePoint - lastPoint)) + Math.abs(firstPoint - lastPoint);
    });

    printOutput(resultSegments.join(''));
}

orchestrateExecution(calculatePathVariations);
