(function (entryPoint) {
    const evaluateGridForStars = (gridDimension, gridContent) =>
        gridContent.every(rowString =>
            rowString.split('').every(charElement => charElement === '*')
        );

    let processedInputLines = entryPoint.replace(/\r/g, '').split("\n");
    let currentGridDimension;
    let currentGridData;

    while (true) {
        currentGridDimension = parseInt(processedInputLines.shift());
        if (currentGridDimension === 0) {
            break;
        }

        currentGridData = [];
        for (let lineIndex = 0; lineIndex < currentGridDimension; lineIndex++) {
            currentGridData.push(processedInputLines.shift());
        }

        if (evaluateGridForStars(currentGridDimension, currentGridData)) {
            console.log(0);
        } else {
            // Employing a dynamic programming strategy to determine the largest square of '.' characters.
            let maximumSquareSideLength = 0;
            // dpTable[row][col] stores the side length of the largest square of '.'
            // with its bottom-right corner positioned at (row, col).
            const dpTable = Array.from({ length: currentGridDimension }, () =>
                Array(currentGridDimension).fill(0)
            );

            for (let row = 0; row < currentGridDimension; row++) {
                for (let col = 0; col < currentGridDimension; col++) {
                    if (currentGridData[row][col] === '.') {
                        if (row === 0 || col === 0) {
                            dpTable[row][col] = 1;
                        } else {
                            dpTable[row][col] = 1 + Math.min(
                                dpTable[row - 1][col],
                                dpTable[row][col - 1],
                                dpTable[row - 1][col - 1]
                            );
                        }
                        if (dpTable[row][col] > maximumSquareSideLength) {
                            maximumSquareSideLength = dpTable[row][col];
                        }
                    }
                }
            }
            console.log(maximumSquareSideLength);
        }
    }
})(require("fs").readFileSync("/dev/stdin", "utf8"));
