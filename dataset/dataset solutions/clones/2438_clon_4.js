"use strict";

// Type IV clone of the GET input parsing utility.
// Uses a functional factory pattern with closures for state management,
// instead of the original's constructor function and prototype methods.
const acquireData = (rawInputContent) => {
    const allInputLines = rawInputContent.trim().split('\n');
    let currentLinePointer = 0;
    let currentLineTokenBuffer = []; // Stores tokens for the current line, reversed for pop() behavior

    // Helper to advance to the next line and clear token buffer
    const advanceToNextLine = () => {
        currentLinePointer++;
        currentLineTokenBuffer = [];
    };

    // Ensures currentLineTokenBuffer has tokens, advancing lines if necessary.
    // Handles empty lines by skipping them.
    const ensureTokensAvailable = () => {
        while (currentLineTokenBuffer.length === 0 && currentLinePointer < allInputLines.length) {
            const lineContent = allInputLines[currentLinePointer];
            const potentialTokens = lineContent.split(' ');
            if (potentialTokens.length === 1 && potentialTokens[0] === '') { // Handle empty lines
                advanceToNextLine();
            } else {
                currentLineTokenBuffer = potentialTokens.reverse(); // Prepare tokens for right-to-left consumption
            }
        }
    };

    // Clones the functionality of g.prototype.a
    const fetchNextValue = (returnAsString) => {
        ensureTokensAvailable();
        if (currentLineTokenBuffer.length === 0) {
            throw new Error("Input exhausted: no more values to fetch.");
        }
        const tokenValue = currentLineTokenBuffer.pop();
        if (currentLineTokenBuffer.length === 0) { // If this line is now empty
            advanceToNextLine();
        }
        return returnAsString ? tokenValue : Number(tokenValue);
    };

    // Clones the functionality of g.prototype.l
    const fetchEntireLine = (returnAsStrings) => {
        if (currentLinePointer >= allInputLines.length) {
            throw new Error("Input exhausted: no more lines to fetch.");
        }
        const lineContent = allInputLines[currentLinePointer++];
        const tokens = lineContent.split(' ');
        return returnAsStrings ? tokens : tokens.map(Number);
    };

    // Clones the functionality of g.prototype.m
    const fetchValueMatrix = (numberOfRows, returnAsStrings) => {
        const resultMatrix = [];
        for (let i = 0; i < numberOfRows; i++) {
            resultMatrix.push(fetchEntireLine(returnAsStrings));
        }
        return resultMatrix;
    };

    // Clones the functionality of g.prototype.r
    const fetchValueRows = (numberOfRows, returnAsStrings) => {
        const resultRows = [];
        for (let i = 0; i < numberOfRows; i++) {
            if (currentLinePointer >= allInputLines.length) {
                throw new Error("Input exhausted: no more rows to fetch.");
            }
            const lineContent = allInputLines[currentLinePointer++];
            resultRows.push(returnAsStrings ? lineContent : Number(lineContent));
        }
        return resultRows;
    };

    return {
        fetchNextValue,
        fetchEntireLine,
        fetchValueMatrix,
        fetchValueRows
    };
};

// Type IV clone of xArray.
// Uses a recursive functional approach to create multi-dimensional arrays,
// avoiding the original's eval-based string concatenation.
function constructNestedArray(initialFillValue, ...dimensions) {
    if (dimensions.length === 0) {
        return initialFillValue;
    }
    const currentDimensionSize = dimensions[0];
    const remainingDimensions = dimensions.slice(1);

    return Array.from({ length: currentDimensionSize }, () =>
        constructNestedArray(initialFillValue, ...remainingDimensions)
    );
}

// Main execution flow: reads input, processes, and prints result.
const inputProcessor = acquireData(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(calculateOptimalValue());

// Type IV clone of the main function.
// Uses functional array methods (forEach, reduce) where appropriate,
// and different variable names and control flow for core logic.
function calculateOptimalValue() {
    const totalItems = inputProcessor.fetchNextValue();
    const maxCapacity = inputProcessor.fetchNextValue();
    const itemDetails = inputProcessor.fetchValueMatrix(totalItems);

    // Dynamic programming table initialization.
    // Original uses t+3001 for size, so indices 0 to t+3000.
    // We replicate this exact size and initial value.
    const dpTable = constructNestedArray(0, maxCapacity + 3001);

    // Iterate through each item using forEach for a functional style.
    itemDetails.forEach(itemSpec => {
        const [itemWeight, itemValue] = itemSpec;

        // Iterate through the capacity from maxCapacity down to 0.
        // This reverse iteration is crucial for 0/1 knapsack-like problems
        // to ensure each item is considered at most once for each capacity.
        for (let currentCapacity = maxCapacity; currentCapacity >= 0; currentCapacity--) {
            const potentialNewCapacity = currentCapacity + itemWeight;

            // Check if adding the item keeps the new capacity within the dpTable bounds.
            // The original code implicitly handles this by array size and JavaScript's
            // behavior with out-of-bounds access (undefined < X is false).
            // Since our dpTable is pre-filled with 0s, we need an explicit bounds check
            // to ensure we don't try to access or modify indices beyond the allocated size.
            if (potentialNewCapacity <= maxCapacity + 3000) {
                // If the value obtained by adding the current item to the value at 'currentCapacity'
                // is greater than the current best value for 'potentialNewCapacity', update it.
                if (dpTable[potentialNewCapacity] < dpTable[currentCapacity] + itemValue) {
                    dpTable[potentialNewCapacity] = dpTable[currentCapacity] + itemValue;
                }
            }
        }
    });

    // Find the maximum value in the dpTable.
    // Using Array.prototype.reduce for a functional approach instead of Math.max(...array).
    return dpTable.reduce((maxValue, currentValue) => Math.max(maxValue, currentValue), 0);
}
