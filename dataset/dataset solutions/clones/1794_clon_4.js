"use strict";

// A custom class for handling input stream operations
class StreamHandler {
    #tokens; // Private field for storing tokens
    #index; // Private field for current position

    constructor(sourceContent) {
        this.#tokens = sourceContent.trim().split(/\s+/); // Split by any whitespace
        this.#index = 0;
    }

    // Fetches the next numerical value
    retrieveNumeric() {
        if (this.#index >= this.#tokens.length) {
            throw new Error("Input stream exhausted.");
        }
        return Number(this.#tokens[this.#index++]);
    }

    // Fetches the next string value
    retrieveTextual() {
        if (this.#index >= this.#tokens.length) {
            throw new Error("Input stream exhausted.");
        }
        return this.#tokens[this.#index++];
    }

    // Fetches the next BigInt value
    retrieveLargeNumeric() {
        if (this.#index >= this.#tokens.length) {
            throw new Error("Input stream exhausted.");
        }
        return BigInt(this.#tokens[this.#index++]);
    }

    // Fetches a specified count of numbers into an array
    retrieveNumericSequence(count) {
        const sequence = [];
        for (let i = 0; i < count; i++) {
            sequence.push(this.retrieveNumeric());
        }
        return sequence;
    }

    // Fetches a specified count of BigInts into an array
    retrieveLargeNumericSequence(count) {
        const sequence = [];
        for (let i = 0; i < count; i++) {
            sequence.push(this.retrieveLargeNumeric());
        }
        return sequence;
    }

    // Fetches a 2D array (matrix) of numbers
    retrieveGrid(rows, columns) {
        const grid = [];
        for (let r = 0; r < rows; r++) {
            grid.push(this.retrieveNumericSequence(columns));
        }
        return grid;
    }
}

// A recursive utility for creating multi-dimensional arrays (divergent from original's eval-based xArray)
const constructMultiArray = (dimensions, filler) => {
    if (dimensions.length === 0) {
        return filler;
    }
    const currentDepth = dimensions[0];
    const remainingDimensions = dimensions.slice(1);
    return Array.from({ length: currentDepth }, () =>
        constructMultiArray(remainingDimensions, filler)
    );
};

// The primary computation logic (equivalent to main)
const processAlgorithm = () => {
    const inputSource = new StreamHandler(require("fs").readFileSync("/dev/stdin", "utf8"));

    const arraySize = inputSource.retrieveNumeric();
    const cycleIterations = inputSource.retrieveNumeric();
    let currentData = inputSource.retrieveNumericSequence(arraySize);

    let currentIteration = 0;
    while (currentIteration < cycleIterations) {
        // Use a difference array (sweep line technique) for efficient range updates
        // This replaces the nested 'j' loop with a single pass for setup and another for cumulative sums.
        const deltaValues = new Array(arraySize + 1).fill(0); // +1 for the boundary marker

        for (let elementIndex = 0; elementIndex < arraySize; elementIndex++) {
            const spreadExtent = currentData[elementIndex];
            const startPosition = Math.max(0, elementIndex - spreadExtent);
            const endPosition = Math.min(arraySize - 1, elementIndex + spreadExtent);

            deltaValues[startPosition]++;
            if (endPosition + 1 < arraySize) { // Ensure the decrement index is within bounds
                deltaValues[endPosition + 1]--;
            }
        }

        const nextDataState = new Array(arraySize);
        let cumulativeSum = 0;

        for (let i = 0; i < arraySize; i++) {
            cumulativeSum += deltaValues[i];
            nextDataState[i] = cumulativeSum;
        }

        currentData = nextDataState;

        // Replicate the original's specific termination condition for Bmin.
        // The original Bmin was effectively Math.min(k, N) when the array stabilizes to [N,N,...,N].
        // Thus, Bmin >= N implies k >= N.
        // The full condition is: if (k > 41 && k >= N) break;
        if (currentIteration > 41 && currentIteration >= arraySize) {
            break;
        }

        currentIteration++;
    }

    return currentData.join(" ");
};

// Execute the algorithm and print the result
console.log(processAlgorithm());