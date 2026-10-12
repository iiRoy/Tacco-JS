function processGridData(inputString) {
    const inputLine = inputString.split("\n")[0];
    const numericParameters = inputLine.split(" ").map(Number);

    const gridHeight = numericParameters[0];
    const gridWidth = numericParameters[1];
    const colThreshold = numericParameters[2];
    const rowThreshold = numericParameters[3];

    const finalGrid = [];

    const calculateCellState = (currentColIndex, currentRowIndex, thresholdA, thresholdB) => {
        const isColIndexBelowThreshold = currentColIndex < thresholdA;
        const isRowIndexBelowThreshold = currentRowIndex < thresholdB;
        return (isColIndexBelowThreshold !== isRowIndexBelowThreshold) ? 1 : 0;
    };

    for (let rowIndex = 0; rowIndex < gridHeight; rowIndex++) {
        const rowContent = new Array(gridWidth);
        for (let colIndex = 0; colIndex < gridWidth; colIndex++) {
            rowContent[colIndex] = calculateCellState(colIndex, rowIndex, colThreshold, rowThreshold);
        }
        finalGrid.push(rowContent);
    }

    for (let rowIndex = 0; rowIndex < gridHeight; rowIndex++) {
        console.log(finalGrid[rowIndex].join(""));
    }
}

processGridData(require("fs").readFileSync("/dev/stdin", "utf8"));
