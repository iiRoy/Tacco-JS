const readAndParseNumericInput = (filePath) => {
    const fileContent = require('fs').readFileSync(filePath, 'utf8');
    const rawTokens = fileContent.split(/[\n ]/).filter(token => token.length > 0);
    return rawTokens.map(token => parseInt(token, 10));
};

const allInputNumbers = readAndParseNumericInput('./sample_e.txt');

const [gridDimensionHeight, gridDimensionWidth, ...rawCoordinateDataWithCount] = allInputNumbers;

const actualCoordinatePairs = rawCoordinateDataWithCount.slice(1);

const impactGrid = Array.from({ length: gridDimensionHeight }, () =>
    Array.from({ length: gridDimensionWidth }, () => 0)
);

const applyCoordinateImpact = (yInput, xInput, gridMatrix) => {
    const targetRowIndex = yInput - 1;
    const targetColIndex = xInput - 1;

    const currentGridHeight = gridMatrix.length;
    const currentGridWidth = gridMatrix[0].length;

    for (let col = 0; col < currentGridWidth; col++) {
        gridMatrix[targetRowIndex][col]++;
    }

    for (let row = 0; row < currentGridHeight; row++) {
        gridMatrix[row][targetColIndex]++;
    }

    gridMatrix[targetRowIndex][targetColIndex]--;
};

const totalCoordinateOperations = actualCoordinatePairs.length / 2;
for (let opIndex = 0; opIndex < totalCoordinateOperations; opIndex++) {
    const currentYValue = actualCoordinatePairs[2 * opIndex];
    const currentXValue = actualCoordinatePairs[2 * opIndex + 1];
    applyCoordinateImpact(currentYValue, currentXValue, impactGrid);
}

let maximumImpactFound = 0;

for (let row = 0; row < gridDimensionHeight; row++) {
    for (let col = 0; col < gridDimensionWidth; col++) {
        const currentCellImpact = impactGrid[row][col];
        if (currentCellImpact > maximumImpactFound) {
            maximumImpactFound = currentCellImpact;
        }
    }
}

console.log(maximumImpactFound);
