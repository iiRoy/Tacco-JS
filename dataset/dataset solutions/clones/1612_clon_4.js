const acquireInput = () => {
    const rawData = require("fs").readFileSync("/dev/stdin", "utf8");
    const dataTokens = rawData.split(/ |\n/).filter(Boolean);
    let tokenPointer = 0;
    return {
        grabNum: () => Number(dataTokens[tokenPointer++]),
        grabSeveralNums: (count) => Array.from({ length: count }, () => Number(dataTokens[tokenPointer++])),
    };
};

const parseTools = acquireInput();
const getNum = parseTools.grabNum;
const getNums = parseTools.grabSeveralNums;

const computeMaximumValue = () => {
    const [rows, columns, itemEntries] = getNums(3);

    const itemRegistry = new Map(); // Map<row, Map<col, value>>

    for (let currentEntry = 0; currentEntry < itemEntries; currentEntry++) {
        const [rowCoord, colCoord, itemValue] = getNums(3);
        if (!itemRegistry.has(rowCoord)) {
            itemRegistry.set(rowCoord, new Map());
        }
        itemRegistry.get(rowCoord).set(colCoord, itemValue);
    }

    const createMatrix = (numRows, numCols, initialValue = 0) =>
        Array.from({ length: numRows }, () => Array.from({ length: numCols }, () => initialValue));

    let previousRowOptimalities = createMatrix(columns + 1, 4);

    const finalOptimalities = Array.from({ length: rows }, (_, rowIdx) => rowIdx + 1)
        .reduce((accumulatedOptimalities, currRow) => {
            const currentRowOptimalities = createMatrix(columns + 1, 4);

            Array.from({ length: columns }, (_, colIdx) => colIdx + 1)
                .forEach(currCol => {
                    const cellItem = itemRegistry.get(currRow)?.get(currCol) || 0;

                    // Calculate state for 0 items taken in current cell
                    currentRowOptimalities[currCol][0] = Math.max(
                        accumulatedOptimalities[currCol][3],
                        currentRowOptimalities[currCol - 1][0]
                    );

                    // Calculate states for 1, 2, or 3 items taken in current cell
                    Array.from({ length: 3 }, (_, itemTakenIdx) => itemTakenIdx + 1)
                        .forEach(itemsPicked => {
                            let currentMax = 0;

                            // Option 1: Don't take item from current cell
                            // This includes carrying over from previous column (current row)
                            // or resetting from previous row (same column, up to 3 items)
                            currentMax = Math.max(accumulatedOptimalities[currCol][3], currentRowOptimalities[currCol - 1][itemsPicked]);

                            // Option 2: Take item from current cell (if available)
                            if (cellItem > 0) {
                                currentMax = Math.max(
                                    currentMax,
                                    accumulatedOptimalities[currCol][3] + cellItem, // Reset from previous row + take current item
                                    currentRowOptimalities[currCol - 1][itemsPicked - 1] + cellItem // Combine with previous column (current row) + take current item
                                );
                            }
                            currentRowOptimalities[currCol][itemsPicked] = currentMax;
                        });
                });
            return currentRowOptimalities;
        }, previousRowOptimalities);

    return Math.max(...finalOptimalities[columns]);
};

const outcome = computeMaximumValue();
if (outcome !== undefined) {
    console.log(String(outcome));
}