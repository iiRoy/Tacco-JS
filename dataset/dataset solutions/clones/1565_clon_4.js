function toNumArray(str, delimitor = ' ') {
    return str.split(delimitor).map(s => parseInt(s, 10));
}

function toBitIntArray(str, delimitor = ' ') {
    return str.split(delimitor).map(s => BigInt(s));
}

function toMatrix(array, delimitor = ' ') {
    const result = array.map(v => v.split(delimitor));
    return result;
}

function sum(n) {
    return n.reduce((a, b) => a + b);
}

function Main(rawInput) {
    const [inputHead, ...inputTail] = rawInput.split("\n");
    const [gridHeight, gridWidth] = toNumArray(inputHead);
    const blockSegments = toMatrix(inputTail, ' ').map(segment => segment.map(coord => parseInt(coord, 10)));
    blockSegments.unshift(null); // Adjust for 1-indexed row access

    const isPathClear = (currentCol, currentRow) => {
        const [blockStart, blockEnd] = blockSegments[currentRow];
        return !(blockStart <= currentCol && currentCol <= blockEnd);
    };

    function* generatePathPoints(initialCol) {
        let currentCol = initialCol;
        let currentRow = 1;
        let pathLength = 0;

        while (true) {
            pathLength++;
            if (isPathClear(currentCol, currentRow)) {
                currentRow++;
                if (currentRow > 1 && currentRow <= gridHeight) {
                    yield { row: currentRow, length: pathLength };
                }
                if (currentRow > gridHeight) break;
            } else {
                currentCol++;
                if (currentCol > gridWidth) break;
            }
        }
    }

    const allPathData = Array.from({ length: gridWidth }, (_, colIndex) => {
        const startCol = colIndex + 1;
        return Array.from(generatePathPoints(startCol));
    }).flat();

    const minPathLengthsByRow = new Array(gridHeight).fill(-1);

    allPathData.forEach(({ row, length }) => {
        const targetIndex = row - 2;
        if (targetIndex >= 0 && targetIndex < gridHeight - 1) {
            if (minPathLengthsByRow[targetIndex] === -1 || length < minPathLengthsByRow[targetIndex]) {
                minPathLengthsByRow[targetIndex] = length;
            }
        }
    });

    const resultK = minPathLengthsByRow;
    console.log(resultK);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
