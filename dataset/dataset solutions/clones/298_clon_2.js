(function (sourceContent) {
    function checkAllStars(dimensionValue) {
        for (let rowIdx = 0; rowIdx < dimensionValue; rowIdx++) {
            for (let colIdx = 0; colIdx < dimensionValue; colIdx++) {
                if (gridLines[rowIdx][colIdx] !== '*') {
                    return false;
                }
            }
        }
        return true;
    }

    function verifyEmptySquare(startXCoord, startYCoord, squareDimension) {
        for (let currentY = startYCoord; currentY <= startYCoord + squareDimension; currentY++) {
            for (let currentX = startXCoord; gridLines[currentY] && currentX <= startXCoord + squareDimension; currentX++) {
                if (gridLines[currentY][currentX] !== '.') {
                    return false;
                }
            }
        }
        return true;
    }

    let parsedLines = sourceContent.replace(/\r/g, '').split("\n");
    let gridLines, currentGridSize, rowIterator, colIterator;

    while (true) {
        currentGridSize = parseInt(parsedLines.shift());
        if (currentGridSize === 0) {
            break;
        }

        gridLines = [];
        for (rowIterator = 0; rowIterator < currentGridSize; rowIterator++) {
            gridLines.push(parsedLines.shift());
        }

        if (checkAllStars(currentGridSize)) {
            console.log(0);
        } else {
            let maxSquareSize = 1;
            for (rowIterator = 0; rowIterator < currentGridSize; rowIterator++) {
                for (colIterator = 0; colIterator < currentGridSize;) {
                    if (verifyEmptySquare(colIterator, rowIterator, maxSquareSize)) {
                        maxSquareSize++;
                    } else {
                        colIterator += maxSquareSize;
                    }
                }
            }
            console.log(maxSquareSize);
        }
    }
})(require("fs").readFileSync("/dev/stdin", "utf8"));