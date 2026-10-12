const parseInteger = (value) => Number.parseInt(value, 10);
const parseIntegerArray = (arr) => arr.map(parseInteger);
const absoluteValue = (num) => Math.abs(num);

const findMin = (...values) => {
    if (values.length === 0) return undefined;
    let minValue = values[0];
    for (let k = 1; k < values.length; k++) {
        if (values[k] < minValue) {
            minValue = values[k];
        }
    }
    return minValue;
};

const findMax = (...values) => {
    if (values.length === 0) return undefined;
    let maxValue = values[0];
    for (let k = 1; k < values.length; k++) {
        if (values[k] > maxValue) {
            maxValue = values[k];
        }
    }
    return maxValue;
};

const greatestCommonDivisor = (...numbers) => {
    if (numbers.length === 0) return 0;
    const calculatePairGCD = (a, b) => b === 0 ? a : calculatePairGCD(b, a % b);
    let result = numbers[0];
    for (let k = 1; k < numbers.length; k++) {
        result = calculatePairGCD(result, numbers[k]);
    }
    return result;
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));

const checkParityConsistency = (currentX, currentY, firstX, firstY) => {
    return (currentX + currentY + firstX + firstY) % 2 !== 0;
};

const adjustParityBasedOnFirstPoint = (coordPair) => {
    return coordPair[0] % 2 === 0 ? coordPair : [coordPair[1], coordPair[0]];
};

const generatePathForCoordinates = (xCoord, yCoord) => {
    let currentX = xCoord;
    let currentY = yCoord;
    const pathSegments = [];
    const BASE_COORD_OFFSET = 10;

    if (currentX % 2 === 1) {
        pathSegments.push('R');
        currentX++;
    }
    if (currentY % 2 === 1) {
        pathSegments.push('R');
        currentY++;
    }

    pathSegments.push(''.padEnd((BASE_COORD_OFFSET + currentX) / 2, 'R'));
    pathSegments.push(''.padEnd((BASE_COORD_OFFSET - currentX) / 2, 'L'));
    pathSegments.push(''.padEnd((BASE_COORD_OFFSET + currentY) / 2, 'U'));
    pathSegments.push(''.padEnd((BASE_COORD_OFFSET - currentY) / 2, 'D'));

    return pathSegments.join('');
};

function processInputData(rawData) {
    const lines = rawData.split('\n');
    const numPoints = parseInteger(lines[0]);
    const coordinates = [];

    for (let idx = 0; idx < numPoints; idx++) {
        const currentLineCoords = parseIntegerArray(lines[idx + 1].split(' '));
        coordinates.push(currentLineCoords);

        if (idx > 0 && checkParityConsistency(coordinates[idx][0], coordinates[idx][1], coordinates[0][0], coordinates[0][1])) {
            console.log(-1);
            return 0;
        }
    }

    const parityOffset = (coordinates[0][0] + coordinates[0][1]) % 2;

    if (parityOffset === 1) {
        coordinates.forEach((coordPair, index) => {
            coordinates[index] = adjustParityBasedOnFirstPoint(coordPair);
        });
    }

    const INITIAL_DIRECTION_COUNT = 20;
    let numDirections = INITIAL_DIRECTION_COUNT;
    numDirections += (coordinates[0][0] % 2 !== 0 ? 1 : 0);
    numDirections += (coordinates[0][1] % 2 !== 0 ? 1 : 0);

    console.log(numDirections);

    const directionSteps = Array(numDirections).fill(1).join(' ');
    console.log(directionSteps);

    coordinates.forEach(currentCoords => {
        const pathString = generatePathForCoordinates(currentCoords[0], currentCoords[1]);
        console.log(pathString);
    });

    return 0;
}
