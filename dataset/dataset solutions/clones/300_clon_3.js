(function (rawInputString) {
    function isClearSquare(startX, startY, currentSideLength) {
        const EMPTY_CELL_MARKER = '.';

        const targetRowEnd = startY + currentSideLength;
        const targetColEnd = startX + currentSideLength;

        for (let r = startY; r <= targetRowEnd; r++) {
            for (let c = startX; c <= targetColEnd; c++) {
                // The original code relies on `gridData[r]` being `undefined` if `r` is out of bounds,
                // and then `undefined[c]` throwing a TypeError. This behavior is preserved.
                if (gridData[r][c] !== EMPTY_CELL_MARKER) {
                    return false;
                }
            }
        }
        return true;
    }

    function readGridData(linesSource, size) {
        const newGrid = [];
        for (let k = 0; k < size; k++) {
            newGrid.push(linesSource.shift());
        }
        return newGrid;
    }

    const processedLines = rawInputString.replace(/\r/g, '').split("\n");

    let gridData;
    let currentGridSize;
    let rowIter, colIter;

    while (true) {
        currentGridSize = parseInt(processedLines.shift());

        if (currentGridSize === 0) {
            break;
        }

        gridData = readGridData(processedLines, currentGridSize);

        let maxFoundSquareDim = 1;

        for (rowIter = 0; rowIter < currentGridSize; rowIter++) {
            for (colIter = 0; colIter < currentGridSize; ) {
                if (isClearSquare(colIter, rowIter, maxFoundSquareDim)) {
                    maxFoundSquareDim++;
                } else {
                    colIter += maxFoundSquareDim;
                }
            }
        }
        console.log(maxFoundSquareDim);
    }
})(require("fs").readFileSync("/dev/stdin", "utf8"));
