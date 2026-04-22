'use strict';

function ProcessSequence(rawText) {
    const dataLines = rawText.split('\n');
    const numericContentLine = dataLines[1];
    const stringRepresentations = numericContentLine.split(' ');
    const numberCollection = stringRepresentations.map(val => parseInt(val, 10));

    const finalResult = numberCollection.reduce((memo, currentItem, currentPosition) => {
        // If the current position has been "skipped" by a previous operation,
        // due to the nature of the allowed swaps, just return the accumulator.
        if (currentPosition < memo.nextValidPosition) {
            return memo;
        }

        // Check if the current item matches its 1-indexed position.
        // (e.g., value 1 at index 0, value 2 at index 1, etc.)
        if (currentItem === currentPosition + 1) {
            memo.operationCount += 1; // Increment the count of possible operations.
            // When an operation occurs at `currentPosition`, it involves `currentPosition`
            // and `currentPosition + 1` (or `currentPosition - 1` if it's the last element).
            // This means the element at `currentPosition + 1` is also affected and
            // cannot be used for an operation in the immediate next iteration.
            // Therefore, we effectively advance the "next position to check" by two.
            memo.nextValidPosition = currentPosition + 2;
        } else {
            // If no operation occurs, simply move to the next position.
            memo.nextValidPosition = currentPosition + 1;
        }
        return memo;
    }, { operationCount: 0, nextValidPosition: 0 }); // Initial state for the accumulator

    console.log(finalResult.operationCount);
}

ProcessSequence(require("fs").readFileSync("/dev/stdin", "utf8"));