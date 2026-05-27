'use strict'

const processInput = rawData => {
    const lines = rawData.trim().split("\n");
    const terminationIdx = lines.indexOf("0 0");
    const problemSets = lines.slice(0, terminationIdx);

    // Initialize an array to store the count of solutions for each problem set.
    const solutionCounts = Array(problemSets.length).fill(0);

    /**
     * Recursively finds combinations of three distinct numbers that sum to a target value.
     * @param {number[]} currentCombo - The combination of numbers built so far.
     * @param {number} currentSumSoFar - The sum of numbers in currentCombo.
     * @param {number} maxVal - The upper bound for numbers (n).
     * @param {number} targetVal - The desired sum (x).
     * @param {number} problemIdx - The index of the current problem set in solutionCounts.
     */
    const findCombinations = (currentCombo, currentSumSoFar, maxVal, targetVal, problemIdx) => {
        // If the current combination already has 3 or more numbers,
        // it cannot be extended to form a new 3-number combination.
        if (currentCombo.length >= 3) {
            return;
        }

        // Determine the starting value for the next number to ensure distinct and increasing order.
        const lastElement = currentCombo.length === 0 ? 0 : currentCombo[currentCombo.length - 1];
        const startSearchVal = lastElement + 1;

        for (let nextNumCandidate = startSearchVal; nextNumCandidate <= maxVal; nextNumCandidate++) {
            const nextSum = currentSumSoFar + nextNumCandidate;
            const nextComboLength = currentCombo.length + 1;

            // If we have exactly three numbers and their sum matches the target, increment the count.
            if (nextComboLength === 3 && nextSum === targetVal) {
                solutionCounts[problemIdx]++;
            }

            // If the current sum is less than the target, continue exploring by adding more numbers.
            // This implicitly respects the `currentCombo.length >= 3` guard.
            if (nextSum < targetVal) {
                // Create a new combination array only when recursing to avoid modifying currentCombo.
                const nextCombo = [...currentCombo, nextNumCandidate];
                findCombinations(nextCombo, nextSum, maxVal, targetVal, problemIdx);
            } else {
                // Optimization: If the current sum is already equal to or greater than the target,
                // adding larger numbers will only increase the sum further, so we can stop this branch.
                break;
            }
        }
    };

    // Iterate through each problem set provided in the input.
    problemSets.forEach((problemLine, idx) => {
        const [nStr, xStr] = problemLine.split(" ");
        const upperBound = parseInt(nStr, 10); // n
        const desiredSum = parseInt(xStr, 10); // x

        // Guard clause: If n is less than 3, or x is less than the minimum possible sum (1+2+3=6),
        // no valid combinations of three distinct numbers can be formed.
        if (upperBound < 3 || desiredSum < 6) {
            return; // Skip to the next problem set; solutionCounts[idx] remains 0.
        }

        // Initiate the recursive search for combinations for the current problem set.
        // Start with an empty combination and a sum of 0.
        findCombinations([], 0, upperBound, desiredSum, idx);
    });

    // Output the results, each on a new line.
    console.log(solutionCounts.join("\n"));
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
