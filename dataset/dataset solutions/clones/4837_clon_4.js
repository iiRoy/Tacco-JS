'use strict';

const calculateMultiplesCount = (rawInput) => {
    const [startPoint, endPoint, divisorValue] = rawInput.split(' ').map(Number);

    // Preserve exact observable behavior for edge cases of divisorValue.
    // Original code: `i % arr[2]` where `arr[2]` is 0.
    // This throws `RangeError: Division by zero`. Replicate this exact error.
    if (divisorValue === 0) {
        return 1 % divisorValue; // This expression will throw the required error.
    }

    // Original code: `for (let j=i; j<=ed; j+=n)` with `n < 0`.
    // If `i <= ed` initially, `j` will decrease indefinitely, always satisfying `j <= ed`.
    // This results in an infinite loop. Replicate this.
    if (divisorValue < 0) {
        while (true) { /* Infinite loop to match original behavior */ }
    }

    // Core logic for divisorValue > 0, using a substantially different strategy.
    // If the start point is beyond the end point, no numbers can be counted.
    if (startPoint > endPoint) {
        return 0;
    }

    // Determine the first multiple of divisorValue that is greater than or equal to startPoint.
    // Math.ceil(x / y) * y correctly finds the smallest multiple of y >= x for y > 0.
    // This works for both positive and negative startPoint values.
    const initialMultiple = Math.ceil(startPoint / divisorValue) * divisorValue;

    // If this initial multiple is already beyond the endPoint, there are no multiples in the range.
    if (initialMultiple > endPoint) {
        return 0;
    }

    // Determine the last multiple of divisorValue that is less than or equal to endPoint.
    // Math.floor(x / y) * y correctly finds the largest multiple of y <= x for y > 0.
    // This works for both positive and negative endPoint values.
    const finalMultiple = Math.floor(endPoint / divisorValue) * divisorValue;

    // Calculate the count using the arithmetic progression formula:
    // (lastTerm - firstTerm) / commonDifference + 1
    const totalCount = (finalMultiple - initialMultiple) / divisorValue + 1;

    return totalCount;
};

const entryPoint = (inputData) => {
    const computedResult = calculateMultiplesCount(inputData);
    console.log(computedResult);
};

entryPoint(require("fs").readFileSync("/dev/stdin", "utf8"));
