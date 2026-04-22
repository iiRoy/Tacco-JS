(function (dataStream) {
    const lineSegments = dataStream.replace(/\r/g, '').split("\n");
    let lineCursor = 0;

    const retrieveNextLine = () => lineSegments[lineCursor++];
    const retrieveNextNumericValue = () => parseInt(retrieveNextLine(), 10);

    const checkClearSquareRegion = (matrixGrid, matrixDimension, colPos, rowPos, extent) => {
        if (rowPos + extent >= matrixDimension || colPos + extent >= matrixDimension) {
            return false;
        }

        const rowsToCheck = Array.from({ length: extent + 1 }, (_, index) => rowPos + index);
        const colsToCheck = Array.from({ length: extent + 1 }, (_, index) => colPos + index);

        return rowsToCheck.every(r =>
            colsToCheck.every(c =>
                matrixGrid[r][c] === '.'
            )
        );
    };

    const processAllGrids = () => {
        const currentDimension = retrieveNextNumericValue();

        if (currentDimension === 0) {
            return;
        }

        const currentMatrix = [];
        for (let rIndex = 0; rIndex < currentDimension; ++rIndex) {
            currentMatrix.push(retrieveNextLine());
        }

        const calculateMaxExtent = (currentY, currentX, currentExtentValue) => {
            if (currentY >= currentDimension) {
                return currentExtentValue;
            }

            if (checkClearSquareRegion(currentMatrix, currentDimension, currentX, currentY, currentExtentValue)) {
                return calculateMaxExtent(currentY, currentX, currentExtentValue + 1);
            } else {
                const nextXPosition = currentX + currentExtentValue;
                if (nextXPosition >= currentDimension) {
                    return calculateMaxExtent(currentY + 1, 0, currentExtentValue);
                } else {
                    return calculateMaxExtent(currentY, nextXPosition, currentExtentValue);
                }
            }
        };

        const finalCalculatedExtent = calculateMaxExtent(0, 0, 1);
        console.log(finalCalculatedExtent);

        processAllGrids();
    };

    processAllGrids();

})(require("fs").readFileSync("/dev/stdin", "utf8"));