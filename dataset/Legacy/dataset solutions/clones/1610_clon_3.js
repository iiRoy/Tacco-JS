const getSafeValue = (arr, ...indices) => {
    let current = arr;
    for (let i = 0; i < indices.length; i++) {
        const idx = indices[i];
        if (current === undefined || current[idx] === undefined) {
            return 0;
        }
        current = current[idx];
    }
    return current;
};

const ensureRowExists = (matrix, rowIndex) => {
    if (!matrix[rowIndex]) {
        matrix[rowIndex] = [];
    }
    return matrix[rowIndex];
};

function processGridData(rawData) {
    let processedLines = rawData.trim().split("\n");

    const firstLineParts = processedLines.shift().split(" ");
    const numRows = parseInt(firstLineParts[0], 10);
    const numCols = parseInt(firstLineParts[1], 10);
    const numItems = parseInt(firstLineParts[2], 10);

    const itemCoordinatesAndValues = processedLines.map((line) =>
        line.split(" ").map((valStr) => parseInt(valStr, 10))
    );

    let gridItems = [];

    itemCoordinatesAndValues.forEach((itemData) => {
        const [itemRow, itemCol, itemValue] = itemData;
        const targetRow = ensureRowExists(gridItems, itemRow - 1);
        targetRow[itemCol - 1] = itemValue;
    });

    const MAX_GRID_DIMENSION = 3005;
    let dynamicProgressionTable = Array.from({ length: MAX_GRID_DIMENSION }, () =>
        Array.from({ length: MAX_GRID_DIMENSION }, () => new Array(4).fill(0))
    );

    for (let rIdx = 0; rIdx < numRows; rIdx++) {
        for (let cIdx = 0; cIdx < numCols; cIdx++) {
            const currentCellItemValue = getSafeValue(gridItems, rIdx, cIdx);

            for (let slotIdx = 2; slotIdx >= 0; slotIdx--) {
                const prevSlotDPValue = getSafeValue(dynamicProgressionTable, rIdx, cIdx, slotIdx);
                const currentSlotDPValue = getSafeValue(dynamicProgressionTable, rIdx, cIdx, slotIdx + 1);
                const potentialNewValue = prevSlotDPValue + currentCellItemValue;
                dynamicProgressionTable[rIdx][cIdx][slotIdx + 1] = Math.max(currentSlotDPValue, potentialNewValue);
            }

            for (let slotIdx = 0; slotIdx < 4; slotIdx++) {
                const currentCellDPValue = getSafeValue(dynamicProgressionTable, rIdx, cIdx, slotIdx);

                const nextRowZeroSlotValue = getSafeValue(dynamicProgressionTable, rIdx + 1, cIdx, 0);
                dynamicProgressionTable[rIdx + 1][cIdx][0] = Math.max(nextRowZeroSlotValue, currentCellDPValue);

                const nextColSlotValue = getSafeValue(dynamicProgressionTable, rIdx, cIdx + 1, slotIdx);
                dynamicProgressionTable[rIdx][cIdx + 1][slotIdx] = Math.max(nextColSlotValue, currentCellDPValue);
            }
        }
    }

    let finalResult = 0;
    for (let slotIdx = 0; slotIdx < 4; slotIdx++) {
        finalResult = Math.max(finalResult, getSafeValue(dynamicProgressionTable, numRows - 1, numCols - 1, slotIdx));
    }
    console.log(finalResult);
}

processGridData(require("fs").readFileSync("/dev/stdin", "utf8"));
