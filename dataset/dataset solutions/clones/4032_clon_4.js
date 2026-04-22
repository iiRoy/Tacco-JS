const { readFileSync: acquireData } = require('node:fs');

const parseGrid = (inputString) => {
    return inputString.trim().split('\n').map(line => line.split(' ').map(Number));
};

const verifyAdditiveProperty = (matrixStructure) => {
    const referencePoint = matrixStructure[0][0];
    const checkCoordinates = [[1, 1], [1, 2], [2, 1], [2, 2]];

    return checkCoordinates.every(([r, c]) => {
        return matrixStructure[r][c] - matrixStructure[r][0] - matrixStructure[0][c] + referencePoint === 0;
    });
};

const extractComponentVectors = (matrixStructure) => {
    const initialElement = matrixStructure[0][0];
    const rowComponents = matrixStructure.map((line, index) => line[0] - initialElement);
    const columnComponents = matrixStructure[0];
    return { rowComponents, columnComponents };
};

const obtainSmallestValue = (dataArray) => {
    return dataArray.reduce((currentMin, currentVal) => Math.min(currentMin, currentVal), Infinity);
};

const processMatrix = () => {
    const contentPayload = acquireData('/dev/stdin', 'utf8');
    const inputGrid = parseGrid(contentPayload);

    if (!verifyAdditiveProperty(inputGrid)) {
        return 'No';
    }

    const { rowComponents, columnComponents } = extractComponentVectors(inputGrid);

    const minimumRowComponent = obtainSmallestValue(rowComponents);
    const minimumColumnComponent = obtainSmallestValue(columnComponents);

    return (minimumRowComponent + minimumColumnComponent === 0) ? 'Yes' : 'No';
};

console.log(processMatrix());