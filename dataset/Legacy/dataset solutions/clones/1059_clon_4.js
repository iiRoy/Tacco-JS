const inputSettings = {
    sourcePath: '/dev/stdin',
    lineSeparator: '\n'
};

const inputLineData = require('fs').readFileSync(inputSettings.sourcePath, 'utf-8').split(inputSettings.lineSeparator);

const makePoint = (coordX, coordY) => [coordX, coordY];

const calculateKochFractal = (iterationCount) => {
    if (iterationCount === 0) {
        return [makePoint(0.0, 0.0), makePoint(100.0, 0.0)];
    }

    let currentSegmentPoints = [makePoint(0.0, 0.0), makePoint(100.0, 0.0)];

    const rotationCos = Math.cos(Math.PI / 3.0);
    const rotationSin = Math.sin(Math.PI / 3.0);

    for (let currentLevel = 0; currentLevel < iterationCount; currentLevel++) {
        const nextLevelPoints = [];
        for (let segmentIndex = 0; segmentIndex < currentSegmentPoints.length - 1; segmentIndex++) {
            const startPoint = currentSegmentPoints[segmentIndex];
            const endPoint = currentSegmentPoints[segmentIndex + 1];

            const firstThirdX = (2 * startPoint[0] + endPoint[0]) / 3;
            const firstThirdY = (2 * startPoint[1] + endPoint[1]) / 3;
            const firstThird = makePoint(firstThirdX, firstThirdY);

            const secondThirdX = (startPoint[0] + 2 * endPoint[0]) / 3;
            const secondThirdY = (startPoint[1] + 2 * endPoint[1]) / 3;
            const secondThird = makePoint(secondThirdX, secondThirdY);

            const deltaX = secondThirdX - firstThirdX;
            const deltaY = secondThirdY - firstThirdY;
            const rotatedX = deltaX * rotationCos - deltaY * rotationSin + firstThirdX;
            const rotatedY = deltaX * rotationSin + deltaY * rotationCos + firstThirdY;
            const rotatedPoint = makePoint(rotatedX, rotatedY);

            nextLevelPoints.push(startPoint);
            nextLevelPoints.push(firstThird);
            nextLevelPoints.push(rotatedPoint);
            nextLevelPoints.push(secondThird);
        }
        nextLevelPoints.push(currentSegmentPoints[currentSegmentPoints.length - 1]);
        currentSegmentPoints = nextLevelPoints;
    }
    return currentSegmentPoints;
};

calculateKochFractal(parseInt(inputLineData[0]))
    .forEach(pointCoords => {
        console.log(pointCoords[0].toFixed(8), pointCoords[1].toFixed(8));
    });
