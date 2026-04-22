function processGridData(rawData) {
    let currentLines = rawData.split('\n');
    let firstLineSkipped = [];
    for (let i = 1; i < currentLines.length; i++) {
        if (currentLines[i].length > 0) {
            firstLineSkipped.push(currentLines[i]);
        }
    }

    let initialLayout = [];
    for (let i = 0; i < firstLineSkipped.length; i++) {
        let rowCharacters = firstLineSkipped[i];
        let rowValues = [];
        for (let j = 0; j < rowCharacters.length; j++) {
            if (rowCharacters[j] === '.') {
                rowValues.push(1);
            } else {
                rowValues.push(0);
            }
        }
        initialLayout.push(rowValues);
    }

    if (initialLayout.length === 0 || (initialLayout.length > 0 && initialLayout[0].length === 0)) {
        console.log('');
        return;
    }

    let rowAdjustedLayout = [];
    for (let i = 0; i < initialLayout.length; i++) {
        let currentRow = initialLayout[i];
        let allOnesInRow = true;
        for (let j = 0; j < currentRow.length; j++) {
            if (currentRow[j] === 0) {
                allOnesInRow = false;
                break;
            }
        }
        if (!allOnesInRow) {
            rowAdjustedLayout.push(currentRow);
        }
    }

    if (rowAdjustedLayout.length === 0) {
        console.log('');
        return;
    }

    let transposedFirstStage = flipDimensions(rowAdjustedLayout);

    let columnAdjustedLayout = [];
    for (let i = 0; i < transposedFirstStage.length; i++) {
        let currentRow = transposedFirstStage[i];
        let allOnesInRow = true;
        for (let j = 0; j < currentRow.length; j++) {
            if (currentRow[j] === 0) {
                allOnesInRow = false;
                break;
            }
        }
        if (!allOnesInRow) {
            columnAdjustedLayout.push(currentRow);
        }
    }

    if (columnAdjustedLayout.length === 0) {
        console.log('');
        return;
    }

    let finalLayout = flipDimensions(columnAdjustedLayout);

    renderOutput(finalLayout);
}

function flipDimensions(inputMatrix) {
    if (inputMatrix.length === 0 || inputMatrix[0].length === 0) {
        return [];
    }
    let numRows = inputMatrix.length;
    let numCols = inputMatrix[0].length;
    let resultMatrix = [];

    for (let j = 0; j < numCols; j++) {
        let newRow = [];
        for (let i = 0; i < numRows; i++) {
            newRow.push(inputMatrix[i][j]);
        }
        resultMatrix.push(newRow);
    }
    return resultMatrix;
}

function renderOutput(processedMatrix) {
    let outputLines = [];
    for (let i = 0; i < processedMatrix.length; i++) {
        let currentLineChars = [];
        for (let j = 0; j < processedMatrix[i].length; j++) {
            if (processedMatrix[i][j] === 1) {
                currentLineChars.push('.');
            } else {
                currentLineChars.push('#');
            }
        }
        outputLines.push(currentLineChars.join(''));
    }
    console.log(outputLines.join('\n'));
}

processGridData(require('fs').readFileSync('/dev/stdin', 'utf8'));