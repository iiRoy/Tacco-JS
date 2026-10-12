function processGridData(rawData) {
    const inputLines = rawData.split("\n");

    const dimensions = inputLines[0].split(" ");
    const gridHeight = parseInt(dimensions[0], 10);
    const gridWidth = parseInt(dimensions[1], 10);

    const blackCellSet = new Set();

    inputLines.slice(1).forEach(lineContent => {
        if (lineContent.length === 0) return;
        const cellCoordinates = lineContent.split(" ");
        const rowZeroIndexed = parseInt(cellCoordinates[0], 10) - 1;
        const colZeroIndexed = parseInt(cellCoordinates[1], 10) - 1;
        blackCellSet.add(`${rowZeroIndexed},${colZeroIndexed}`);
    });

    const blackCellCounts = Array(10).fill(0);

    for (let topRow = 0; topRow <= gridHeight - 3; topRow++) {
        for (let leftCol = 0; leftCol <= gridWidth - 3; leftCol++) {
            let currentSquareBlackCount = 0;

            Array.from({ length: 3 }, (_, rowOffset) => {
                Array.from({ length: 3 }, (_, colOffset) => {
                    const checkRow = topRow + rowOffset;
                    const checkCol = leftCol + colOffset;
                    if (blackCellSet.has(`${checkRow},${checkCol}`)) {
                        currentSquareBlackCount++;
                    }
                });
            });
            
            blackCellCounts[currentSquareBlackCount]++;
        }
    }

    console.log(blackCellCounts.join("\n"));
}

processGridData(require("fs").readFileSync("/dev/stdin", "utf8"));
