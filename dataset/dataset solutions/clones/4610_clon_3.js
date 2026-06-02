"use strict";

const extractProblemParameters = (firstLineContent) => {
    const parts = firstLineContent.split(" ");
    const numItems = parseInt(parts[0], 10);
    const capacityLimit = parseInt(parts[1], 10);
    return { numItems, capacityLimit };
};

const createMemoizationTable = (rows, cols, initialValue = 0) => {
    const table = new Array(rows);
    for (let r = 0; r < rows; r++) {
        table[r] = new Array(cols).fill(initialValue);
    }
    return table;
};

const processInput = (inputString) => {
    const processedLines = inputString.trim().split("\n");

    const { numItems: itemCount, capacityLimit: maxWeight } = extractProblemParameters(processedLines[0]);

    const itemsData = processedLines.slice(1, itemCount + 1).map(line =>
        line.split(" ").map(valStr => parseInt(valStr, 10))
    );

    const memoTable = createMemoizationTable(itemCount + 1, maxWeight + 1);

    for (let currentItemIndex = 1; currentItemIndex <= itemCount; currentItemIndex++) {
        const itemDetails = itemsData[currentItemIndex - 1];
        const itemWeight = itemDetails[0];
        const itemValue = itemDetails[1];

        for (let currentCapacity = 0; currentCapacity <= maxWeight; currentCapacity++) {
            const previousRowValueForCurrentCapacity = memoTable[currentItemIndex - 1][currentCapacity];

            if (itemWeight > currentCapacity) {
                memoTable[currentItemIndex][currentCapacity] = previousRowValueForCurrentCapacity;
            } else {
                const valueIfItemNotTaken = previousRowValueForCurrentCapacity;
                
                const remainingCapacityAfterTakingItem = currentCapacity - itemWeight;
                const valueFromPreviousStateWithRemainingCapacity = memoTable[currentItemIndex - 1][remainingCapacityAfterTakingItem];
                const valueIfItemTaken = itemValue + valueFromPreviousStateWithRemainingCapacity;

                memoTable[currentItemIndex][currentCapacity] = Math.max(valueIfItemNotTaken, valueIfItemTaken);
            }
        }
    }

    console.log(memoTable[itemCount][maxWeight]);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
