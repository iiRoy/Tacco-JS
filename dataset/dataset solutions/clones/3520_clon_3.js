var parseInteger = val => Number.parseInt(val, 10);
var parseIntegerArray = arr => arr.map(item => parseInteger(item));

function processInput(rawData) {
    const lines = rawData.split('\n');
    const numPoints = parseInteger(lines[0]);
    let coordinates = [];

    const hasParityMismatch = (x1, y1, x2, y2) => {
        return (x1 + y1 + x2 + y2) % 2 !== 0;
    };

    for (let idx = 0; idx < numPoints; idx++) {
        coordinates[idx] = parseIntegerArray(lines[idx + 1].split(' '));
        
        const currentPointX = coordinates[idx][0];
        const currentPointY = coordinates[idx][1];
        const firstPointX = coordinates[0][0];
        const firstPointY = coordinates[0][1];

        if (hasParityMismatch(currentPointX, currentPointY, firstPointX, firstPointY)) {
            console.log(-1);
            return 0;
        }
    }

    const initialParitySum = coordinates[0][0] + coordinates[0][1];
    const parityOffset = initialParitySum % 2;

    if (parityOffset !== 0) {
        coordinates = coordinates.map(coordPair => {
            const isXOdd = coordPair[0] % 2 !== 0;
            return isXOdd ? [coordPair[1], coordPair[0]] : coordPair;
        });
    }

    const baseDirectionsCount = 20;
    let totalDirections = baseDirectionsCount;
    
    if (coordinates[0][0] % 2 !== 0) {
        totalDirections++;
    }
    if (coordinates[0][1] % 2 !== 0) {
        totalDirections++;
    }

    console.log(totalDirections);

    const directionMagnitudes = Array(totalDirections).fill(1).join(' ');
    console.log(directionMagnitudes);

    const pathSegmentBaseValue = 10;

    const buildPathSegment = (value, base, charPositive, charNegative) => {
        const positiveLength = (base + value) / 2;
        const negativeLength = (base - value) / 2;
        let segment = '';
        if (positiveLength > 0) {
            segment += ''.padEnd(positiveLength, charPositive);
        }
        if (negativeLength > 0) {
            segment += ''.padEnd(negativeLength, charNegative);
        }
        return segment;
    };

    for (let idx = 0; idx < numPoints; idx++) {
        let pathString = '';
        let currentCoordPair = [...coordinates[idx]];

        if (currentCoordPair[0] % 2 !== 0) {
            pathString += 'R';
            currentCoordPair[0]++;
        }
        if (currentCoordPair[1] % 2 !== 0) {
            pathString += 'R';
            currentCoordPair[1]++;
        }
        
        pathString += buildPathSegment(currentCoordPair[0], pathSegmentBaseValue, 'R', 'L');
        pathString += buildPathSegment(currentCoordPair[1], pathSegmentBaseValue, 'U', 'D');
        
        console.log(pathString);
    }

    return 0;
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
