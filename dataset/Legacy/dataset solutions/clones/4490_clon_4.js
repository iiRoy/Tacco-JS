'use strict';

function ProcessInputAndSum(rawContent) {
    const firstLine = rawContent.split('\n')[0];

    // Use a regular expression to extract all numbers, including negative ones.
    // This replaces the `split(" ")` approach.
    const numberStrings = firstLine.match(/-?\d+/g) || [];

    // Convert all extracted string numbers to actual numbers.
    // This replaces the `parseInt` calls.
    const numericValues = numberStrings.map(Number);

    // Handle cases where there are fewer than two numbers to match the original's
    // behavior of producing NaN when trying to parse an undefined second element.
    if (numericValues.length < 2) {
        // If there's only one number, `numericValues[1]` will be `undefined`.
        // `Number(undefined)` results in `NaN`.
        // Adding a number to `NaN` results in `NaN`.
        // If there are no numbers, both `numericValues[0]` and `numericValues[1]` are `undefined`,
        // resulting in `NaN + NaN = NaN`.
        const val1 = numericValues[0];
        const val2 = numericValues[1];
        console.log(Number(val1) + Number(val2));
        return;
    }

    let smallestVal = Infinity;
    let secondSmallestVal = Infinity;

    // Iterate through the numeric values to find the two smallest.
    // This imperative loop with conditionals replaces the `sort` method.
    for (let i = 0; i < numericValues.length; i++) {
        const currentNum = numericValues[i];

        if (currentNum < smallestVal) {
            // If current number is smaller than the current smallest,
            // the old smallest becomes the new second smallest.
            secondSmallestVal = smallestVal;
            smallestVal = currentNum;
        } else if (currentNum < secondSmallestVal) {
            // If current number is not the smallest, but is smaller than the
            // current second smallest, it becomes the new second smallest.
            secondSmallestVal = currentNum;
        }
    }

    // Sum the two smallest values found.
    console.log(smallestVal + secondSmallestVal);
}

// The external contract for reading input must remain identical.
ProcessInputAndSum(require("fs").readFileSync("/dev/stdin", "utf8"));
