'use strict';

function ProcessInput(rawData) {
    const lines = rawData.split("\n");
    const elementCount = parseInt(lines[0], 10);
    const numericSequence = lines[1].split(' ').map(val => parseInt(val, 10));

    const totalAggregate = numericSequence.reduce((prevVal, currVal) => prevVal + currVal, 0);

    // The core logic is transformed from an imperative loop to a functional reduction.
    // We iterate through the elements that would form the left partition of the array.
    // For an array of 'elementCount' elements, there are 'elementCount - 1' possible split points.
    // The 'slice' method creates a new array containing the first 'elementCount - 1' elements,
    // which are the potential last elements of the left partition.
    // The 'reduce' method then processes these elements.
    const { minimalDisparity } = numericSequence.slice(0, elementCount - 1).reduce((accumulator, currentElement) => {
        // Accumulate the sum of the left partition
        accumulator.currentLeftPartSum += currentElement;

        // Calculate the absolute difference between the two partitions
        // Left partition sum: accumulator.currentLeftPartSum
        // Right partition sum: totalAggregate - accumulator.currentLeftPartSum
        // Difference: Math.abs(accumulator.currentLeftPartSum - (totalAggregate - accumulator.currentLeftPartSum))
        // Which simplifies to: Math.abs(2 * accumulator.currentLeftPartSum - totalAggregate)
        const currentDisparity = Math.abs(2 * accumulator.currentLeftPartSum - totalAggregate);

        // Update the minimum disparity found so far using Math.min for a more declarative approach
        accumulator.minimalDisparity = Math.min(accumulator.minimalDisparity, currentDisparity);

        return accumulator;
    }, { currentLeftPartSum: 0, minimalDisparity: Infinity }); // Initial state: left sum is 0, min disparity is effectively infinite

    console.log(minimalDisparity);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
