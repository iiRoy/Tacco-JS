"use strict";

function processInputRanges(inputData) {
    const lines = inputData.split("\n");

    const firstLineParts = lines[0].split(" ");
    // const countN = parseInt(firstLineParts[0]); // N is not used in the logic
    const rangeCountM = parseInt(firstLineParts[1]);

    const initialRangeParts = lines[1].split(" ");
    const initialLowerBound = parseInt(initialRangeParts[0]);
    const initialUpperBound = parseInt(initialRangeParts[1]);

    const subsequentRangeStrings = Array.from({ length: rangeCountM - 1 }, (_, idx) => lines[idx + 2]);

    const finalIntersectionBounds = subsequentRangeStrings.reduce((currentBounds, rangeDefinitionString) => {
            const [currentLower, currentUpper] = currentBounds;

            // If the intersection has already become empty, propagate that state.
            if (currentLower > currentUpper) {
                return [0, -1];
            }

            const [nextLowerStr, nextUpperStr] = rangeDefinitionString.split(" ");
            const nextLower = parseInt(nextLowerStr);
            const nextUpper = parseInt(nextUpperStr);

            const newLower = Math.max(currentLower, nextLower);
            const newUpper = Math.min(currentUpper, nextUpper);

            // If the new intersection is empty, return the designated empty state [0, -1].
            if (newLower > newUpper) {
                return [0, -1];
            } else {
                return [newLower, newUpper];
            }
        }, [initialLowerBound, initialUpperBound]);

    const [resultLower, resultUpper] = finalIntersectionBounds;
    const numberOfIntegers = Math.max(0, resultUpper - resultLower + 1);

    console.log(numberOfIntegers);
}

processInputRanges(require("fs").readFileSync("/dev/stdin", "utf8"));
