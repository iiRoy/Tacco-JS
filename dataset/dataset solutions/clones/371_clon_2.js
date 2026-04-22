function DetectDuplicates(inputArray) {
    let frequencyMap = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    inputArray.forEach(function (currentElement) {
        frequencyMap[Number(currentElement)]++;
    });

    let duplicateIndices = [];
    frequencyMap.forEach(function (countValue, indexPosition) {
        if (countValue >= 2) {
            duplicateIndices.push(indexPosition);
        }
    });

    let problematicPositions = [];
    inputArray.forEach(function (elementValue, originalIndex) {
        if (duplicateIndices.indexOf(elementValue) !== -1) {
            problematicPositions.push(originalIndex);
        }
    });
    return problematicPositions;
}

let rawData = require('node:fs').readFileSync('/dev/fd/0', 'utf8');
let lineData = rawData.trim().split("\n");

let numCases = parseInt(lineData.shift(), 10);

for (let caseIndex = 0; caseIndex < numCases; caseIndex++) {
    if (caseIndex !== 0) {
        console.log("\n");
    }

    let gridNumbers = [];
    let errorTracker = [];

    for (let rowCounter = 0; rowCounter < 9; rowCounter++) {
        let parsedRow = lineData.shift().split(" ").map(Number);
        gridNumbers.push(parsedRow);
        errorTracker.push([0, 0, 0, 0, 0, 0, 0, 0, 0]);
    }

    for (let rowCounter = 0; rowCounter < 9; rowCounter++) {
        let duplicateInfo = DetectDuplicates(gridNumbers[rowCounter]);
        duplicateInfo.forEach(function (offendingIndex) {
            errorTracker[rowCounter][offendingIndex]++;
        });
    }

    for (let colCounter = 0; colCounter < 9; colCounter++) {
        let columnElements = [];
        for (let elementCounter = 0; elementCounter < 9; elementCounter++) {
            columnElements.push(gridNumbers[elementCounter][colCounter]);
        }
        let colDuplicateInfo = DetectDuplicates(columnElements);
        colDuplicateInfo.forEach(function (problematicRow) {
            errorTracker[problematicRow][colCounter]++;
        });
    }

    for (let blockRowIndex = 0; blockRowIndex < 3; blockRowIndex++) {
        for (let blockColIndex = 0; blockColIndex < 3; blockColIndex++) {
            let startRow = blockRowIndex * 3;
            let startCol = blockColIndex * 3;

            let blockCoordinates = [
                [startRow, startCol], [startRow, startCol + 1], [startRow, startCol + 2],
                [startRow + 1, startCol], [startRow + 1, startCol + 1], [startRow + 1, startCol + 2],
                [startRow + 2, startCol], [startRow + 2, startCol + 1], [startRow + 2, startCol + 2]
            ];

            let blockElements = [];
            blockCoordinates.forEach(function (coordPair) {
                blockElements.push(gridNumbers[coordPair[0]][coordPair[1]]);
            });

            let blockDuplicateInfo = DetectDuplicates(blockElements);
            blockDuplicateInfo.forEach(function (localIndex) {
                errorTracker[blockCoordinates[localIndex][0]][blockCoordinates[localIndex][1]]++;
            });
        }
    }

    gridNumbers.forEach(function (rowContent, rowIndex) {
        rowContent.forEach(function (cellValue, colIndex) {
            gridNumbers[rowIndex][colIndex] = (errorTracker[rowIndex][colIndex] >= 1) ? "*" + cellValue : " " + cellValue;
        });
    });

    console.log(gridNumbers.join("\n").replace(/,/g, ""));
}