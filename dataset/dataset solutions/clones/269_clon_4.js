const fileSystem = require('fs');

const processGridOperations = (inputData) => {
    const numericInputs = inputData.trim().split("\n").map(Number);

    for (let inputIndex = 0; inputIndex < numericInputs.length; inputIndex++) {
        const currentGridSize = numericInputs[inputIndex];

        if (currentGridSize === 0) {
            break;
        }

        const maximumValue = currentGridSize * currentGridSize;

        const gridContainer = Array.from({ length: currentGridSize }, () =>
            Array.from({ length: currentGridSize }, () => -1)
        );

        let startColumn = Math.floor(currentGridSize / 2);
        let startRow = startColumn + 1;

        gridContainer[startRow][startColumn] = ("   " + 1).slice(-4);

        let valueToPlace = 2;
        let currentRowPosition = startRow;
        let currentColPosition = startColumn;

        while (valueToPlace <= maximumValue) {
            let potentialNextRow = (currentRowPosition + 1) % currentGridSize;
            let potentialNextCol = (currentColPosition + 1) % currentGridSize;

            if (gridContainer[potentialNextRow][potentialNextCol] !== -1) {
                // If the (row+1, col+1) position is occupied,
                // the actual next position is (row+1, col-1) relative to the *current* position.
                currentRowPosition = (currentRowPosition + 1) % currentGridSize;
                currentColPosition = (currentColPosition - 1 + currentGridSize) % currentGridSize;
            } else {
                // If the (row+1, col+1) position is empty,
                // that becomes the new current position.
                currentRowPosition = potentialNextRow;
                currentColPosition = potentialNextCol;
            }

            gridContainer[currentRowPosition][currentColPosition] = ("   " + valueToPlace).slice(-4);
            valueToPlace++;
        }

        console.log(gridContainer.map(row => row.join("")).join("\n"));
    }
};

const rawInput = fileSystem.readFileSync('/dev/stdin', 'utf8');
processGridOperations(rawInput);
