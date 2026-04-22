"use strict";

const fileAccess = require("fs");

class DataProcessor {
    constructor(sourcePath) {
        this.sourceContents = fileAccess.readFileSync(sourcePath, "utf8");
        // Split by any whitespace sequence and remove empty strings
        this.valueUnits = this.sourceContents.split(/\s+/).filter(Boolean);
        this.currentPosition = 0;
    }

    retrieveNumber() {
        if (this.currentPosition >= this.valueUnits.length) {
            throw new Error("Input stream exhausted.");
        }
        return Number(this.valueUnits[this.currentPosition++]);
    }

    retrieveNumbers(count) {
        const collectedValues = [];
        for (let idx = 0; idx < count; idx++) {
            collectedValues.push(this.retrieveNumber());
        }
        return collectedValues;
    }
}

const calculateOutcome = () => {
    const dataSource = new DataProcessor("/dev/stdin");
    const quantity = dataSource.retrieveNumber();
    // Initialize sequence with a leading zero, then append retrieved numbers
    const initialSequence = [0, ...dataSource.retrieveNumbers(quantity)];

    // Recursive helper function for the core processing logic
    const processSequenceRecursively = (
        iterationIndex,
        currentSequenceState,
        maximumIndex
    ) => {
        // Base case: if all indices have been processed, return the final state
        if (iterationIndex < 1) {
            return currentSequenceState;
        }

        const elementAtCurrentIndex = currentSequenceState[iterationIndex];

        // If the element is non-negative, proceed to the next lower index without modification
        if (elementAtCurrentIndex >= 0) {
            return processSequenceRecursively(
                iterationIndex - 1,
                currentSequenceState,
                maximumIndex
            );
        }

        // If the element is negative, calculate the sum of its multiples in the current sequence
        let accumulatedValue = 0;
        for (
            let multiplePointer = iterationIndex;
            multiplePointer <= maximumIndex;
            multiplePointer += iterationIndex
        ) {
            accumulatedValue += currentSequenceState[multiplePointer];
        }

        // If the accumulated sum is negative, modify the sequence and restart the process
        if (accumulatedValue < 0) {
            // Create a new sequence to maintain functional purity (avoid direct mutation)
            const newlyModifiedSequence = [...currentSequenceState];
            for (
                let multiplePointer = iterationIndex;
                multiplePointer <= maximumIndex;
                multiplePointer += iterationIndex
            ) {
                newlyModifiedSequence[multiplePointer] = 0;
            }
            // Restart the entire processing from the maximum index with the modified sequence
            return processSequenceRecursively(
                maximumIndex, // Effectively 'goto n'
                newlyModifiedSequence,
                maximumIndex
            );
        } else {
            // If the accumulated sum is non-negative, proceed to the next lower index without modification
            return processSequenceRecursively(
                iterationIndex - 1,
                currentSequenceState,
                maximumIndex
            );
        }
    };

    // Begin the recursive processing
    const finalSequence = processSequenceRecursively(
        quantity,
        initialSequence,
        quantity
    );

    // Calculate the total sum of elements in the final sequence using a simple loop
    let overallSum = 0;
    for (const value of finalSequence) {
        overallSum += value;
    }
    return overallSum;
};

const finalResult = calculateOutcome();
if (finalResult !== undefined) {
    console.log(String(finalResult));
}