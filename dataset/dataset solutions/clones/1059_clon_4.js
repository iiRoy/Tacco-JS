const ioSetup = {
    sourcePath: '/dev/stdin',
    lineDelimiter: '\n'
};

const fileContents = require('fs').readFileSync(ioSetup.sourcePath, 'utf-8');
const processedInput = fileContents.split(ioSetup.lineDelimiter);

const rotationAngle = Math.PI / 3.0;
const cosineValue = Math.cos(rotationAngle);
const sineValue = Math.sin(rotationAngle);

const transformSegment = (segmentStart, segmentEnd) => {
    const xA = segmentStart[0];
    const yA = segmentStart[1];
    const xB = segmentEnd[0];
    const yB = segmentEnd[1];

    const firstThirdX = (2 * xA + xB) / 3;
    const firstThirdY = (2 * yA + yB) / 3;

    const secondThirdX = (xA + 2 * xB) / 3;
    const secondThirdY = (yA + 2 * yB) / 3;

    const segmentDx = secondThirdX - firstThirdX;
    const segmentDy = secondThirdY - firstThirdY;

    const rotatedApexX = segmentDx * cosineValue - segmentDy * sineValue + firstThirdX;
    const rotatedApexY = segmentDx * sineValue + segmentDy * cosineValue + firstThirdY;

    return [
        [firstThirdX, firstThirdY],
        [rotatedApexX, rotatedApexY],
        [secondThirdX, secondThirdY]
    ];
};

const generateFractalPath = (operationCount) => {
    let currentPointList = [[0.0, 0.0], [100.0, 0.0]];

    for (let currentStep = 0; currentStep < operationCount; currentStep++) {
        const nextPointList = [currentPointList[0]];

        for (let i = 0; i < currentPointList.length - 1; i++) {
            const pA = currentPointList[i];
            const pB = currentPointList[i+1];

            const intermediatePoints = transformSegment(pA, pB);
            
            nextPointList.push(...intermediatePoints);
            nextPointList.push(pB);
        }
        currentPointList = nextPointList;
    }
    return currentPointList;
};

const fractalLevel = parseInt(processedInput[0]);
generateFractalPath(fractalLevel).forEach(pointTuple => {
    console.log(pointTuple[0].toFixed(8), pointTuple[1].toFixed(8));
});