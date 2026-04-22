(function (sourceText) {

    function processOneGrid(gridLines, gridDimension) {
        const checkFull = (matrix, dim) => {
            return matrix.every(line => line.split('').every(character => character === '*'));
        };

        const locateMaxSquare = (matrix, dim) => {
            let maxSquareValue = 0;
            const dpTable = Array(dim).fill(0).map(() => Array(dim).fill(0));

            for (let currentR = 0; currentR < dim; ++currentR) {
                for (let currentC = 0; currentC < dim; ++currentC) {
                    if (matrix[currentR][currentC] === '.') {
                        if (currentR === 0 || currentC === 0) {
                            dpTable[currentR][currentC] = 1;
                        } else {
                            dpTable[currentR][currentC] = Math.min(
                                dpTable[currentR - 1][currentC],
                                dpTable[currentR][currentC - 1],
                                dpTable[currentR - 1][currentC - 1]
                            ) + 1;
                        }
                        if (dpTable[currentR][currentC] > maxSquareValue) {
                            maxSquareValue = dpTable[currentR][currentC];
                        }
                    }
                }
            }
            return maxSquareValue;
        };

        if (checkFull(gridLines, gridDimension)) {
            console.log(0);
        } else {
            console.log(locateMaxSquare(gridLines, gridDimension));
        }
    }

    function handleAllCases(allInputLines) {
        let lineCursor = 0;
        while (lineCursor < allInputLines.length) {
            const currentDimension = Number(allInputLines[lineCursor]);
            lineCursor++;

            if (currentDimension === 0) {
                break;
            }

            const gridContent = [];
            for (let i = 0; i < currentDimension; ++i) {
                gridContent.push(allInputLines[lineCursor + i]);
            }
            lineCursor += currentDimension;

            processOneGrid(gridContent, currentDimension);
        }
    }

    const processedInput = sourceText.replace(/\r/g, '').split('\n').filter(Boolean);
    handleAllCases(processedInput);

})(require("fs").readFileSync("/dev/stdin", "utf8"));