const inputData = require("fs").readFileSync("/dev/stdin", "utf8").trim().split('\n');

const [gridDimension, patternDimension] = inputData[0].split(' ').map(Number);
const mainGridData = inputData.slice(1, 1 + gridDimension).map(lineContent => lineContent.split(''));
const searchPatternData = inputData.slice(1 + gridDimension, 1 + gridDimension + patternDimension).map(lineContent => lineContent.split(''));

const checkSubgridMatch = (startRow, startCol, primaryMatrix, secondaryMatrix, secondaryMatrixSize) => {
    return Array.from({ length: secondaryMatrixSize }).every((_, rIndex) => {
        return Array.from({ length: secondaryMatrixSize }).every((__, cIndex) => {
            return primaryMatrix[startRow + rIndex][startCol + cIndex] === secondaryMatrix[rIndex][cIndex];
        });
    });
};

let foundMatchIndicator = false;

Array.from({ length: gridDimension - patternDimension + 1 }).some((_, currentY) => {
    return Array.from({ length: gridDimension - patternDimension + 1 }).some((__, currentX) => {
        if (checkSubgridMatch(currentY, currentX, mainGridData, searchPatternData, patternDimension)) {
            foundMatchIndicator = true;
            return true;
        }
        return false;
    });
});

if (foundMatchIndicator) {
    console.log('Yes');
} else {
    console.log('No');
}
