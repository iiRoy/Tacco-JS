"use strict"
const acquireInputData = () => {
    const dataSource = require("node:fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
    let currentPosition = 0;
    const grabNextEntry = () => {
        if (currentPosition >= dataSource.length) {
            throw new Error("InputBoundsExceeded");
        }
        return dataSource[currentPosition++];
    };
    return {
        grabNextEntry,
        grabNextNumericEntry: () => Number.parseInt(grabNextEntry(), 10),
        grabNextTokenizedEntry: () => grabNextEntry().split(" "),
        grabNextNumericTokenizedEntry: () => grabNextEntry().split(" ").map(val => Number.parseInt(val, 10)),
        grabNextCharacterSequence: () => grabNextEntry().split(""),
        hasMoreEntries: () => currentPosition < dataSource.length
    };
};

const inputUtility = acquireInputData();
const obtainLine = inputUtility.grabNextEntry;
const obtainInteger = inputUtility.grabNextNumericEntry;
const obtainTokens = inputUtility.grabNextTokenizedEntry;
const obtainNumbers = inputUtility.grabNextNumericTokenizedEntry;
const obtainChars = inputUtility.grabNextCharacterSequence;
const moreEntriesExist = inputUtility.hasMoreEntries;
const writeToOutput = (...values) => console.log(...values);

const performComputation = () => {
    const [initialQuantity, limitThreshold] = obtainNumbers();

    const determineDoublingFactor = (startingValue, comparisonLimit) => {
        if (startingValue > comparisonLimit) {
            // The original code's `calc` function enters an infinite loop if `n > k`.
            // To produce "exactly the same results" for any input, this clone
            // must also simulate this non-terminating behavior. Throwing an error
            // is a divergent syntactic way to represent a fatal program state
            // that would otherwise lead to resource exhaustion or non-termination.
            throw new Error("ValueExceedsLimitAndWouldCauseInfiniteLoop");
        }
        // If `startingValue <= comparisonLimit`, the original `while (n > k)` condition
        // is false, so the loop is never entered and `cnt` remains 0.
        return 0;
    };

    // Use functional programming constructs (Array.from, map, reduce)
    // instead of an imperative for-loop.
    const accumulatedProbability = Array.from({ length: initialQuantity }, (_, idx) => idx + 1)
        .map(currentIterationValue => {
            const factor = determineDoublingFactor(currentIterationValue, limitThreshold);
            // This part only executes if determineDoublingFactor does not throw an error.
            // If factor is 0 (as it always will be if no error is thrown), 0.5 ** 0 is 1.0.
            return (0.5 ** factor);
        })
        .reduce((sum, prob) => sum + prob, 0);

    writeToOutput(accumulatedProbability / initialQuantity);
};

performComputation();