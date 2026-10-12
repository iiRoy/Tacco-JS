const processGrid = (inputLines) => {
    const [dimensionString, ...gridContent] = inputLines;
    const [gridHeight, gridWidth] = dimensionString.split(' ').map(Number);

    const cellPathData = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(null));

    let maximumPathLength = 0;
    let maxPossibleReached = false;

    for (let rowIndex = 0; rowIndex < gridHeight; rowIndex++) {
        for (let colIndex = 0; colIndex < gridWidth; colIndex++) {
            if (gridContent[rowIndex][colIndex] === '#') {
                cellPathData[rowIndex][colIndex] = null;
            } else {
                let currentHorizontalLength = 1;
                let currentVerticalLength = 1;

                if (colIndex > 0 && cellPathData[rowIndex][colIndex - 1] !== null) {
                    currentHorizontalLength = cellPathData[rowIndex][colIndex - 1].hLen + 1;
                }

                if (rowIndex > 0 && cellPathData[rowIndex - 1][colIndex] !== null) {
                    currentVerticalLength = cellPathData[rowIndex - 1][colIndex].vLen + 1;
                }

                cellPathData[rowIndex][colIndex] = { hLen: currentHorizontalLength, vLen: currentVerticalLength };

                const combinedPathSum = currentHorizontalLength + currentVerticalLength - 1;
                if (combinedPathSum > maximumPathLength) {
                    maximumPathLength = combinedPathSum;
                }

                if (maximumPathLength === gridHeight + gridWidth - 1) {
                    maxPossibleReached = true;
                    break;
                }
            }
        }
        if (maxPossibleReached) {
            break;
        }
    }

    console.log(maximumPathLength);
};

processGrid(require('fs').readFileSync('/dev/stdin', 'UTF-8').trim().split("\n"));
