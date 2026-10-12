const fs = require('fs');

const acquireInputData = () => {
    const sourceContent = fs.readFileSync('/dev/stdin', 'utf8');
    return sourceContent.split('\n').filter(Boolean);
};

const evaluateSegments = (coordinateSequence) => {
    const numericalCoordinates = coordinateSequence.split(',').map(Number);

    const vertices = [];
    for (let i = 0; i < numericalCoordinates.length; i += 2) {
        vertices.push({ x: numericalCoordinates[i], y: numericalCoordinates[i + 1] });
    }

    const pathSegments = [
        { initial: vertices[0], terminal: vertices[1] },
        { initial: vertices[1], terminal: vertices[2] },
        { initial: vertices[2], terminal: vertices[3] },
        { initial: vertices[3], terminal: vertices[0] }
    ];

    const checkGradientSign = (pointOne, pointTwo) => {
        const yDelta = pointOne.y - pointTwo.y;
        const xDelta = pointOne.x - pointTwo.x;
        const gradient = yDelta / xDelta;
        return gradient >= 0;
    };

    const positiveGradientCount = pathSegments.reduce((tally, segment) => {
        return tally + (checkGradientSign(segment.initial, segment.terminal) ? 1 : 0);
    }, 0);

    console.log(positiveGradientCount % 2 === 1 ? 'YES' : 'NO');
};

const processAllEntries = (entryLines) => {
    entryLines.forEach(evaluateSegments);
};

const allInputLines = acquireInputData();
processAllEntries(allInputLines);
