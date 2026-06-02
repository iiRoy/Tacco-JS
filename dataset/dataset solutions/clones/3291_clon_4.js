'use strict';
process.stdin.resume();
process.stdin.setEncoding('utf8');

const processInputAndCompute = (inputData) => {
    const lines = inputData.split("\n");
    const stoneCount = parseInt(lines[0], 10);
    const stoneHeights = lines[1].split(" ").map(Number);

    // Initialize an array to store the minimum cost to reach each stone.
    // The size is stoneCount + 3 to accommodate potential out-of-bounds
    // accesses for minCosts[i+1] and minCosts[i+2] when i reaches stoneCount.
    // Specifically, when i = stoneCount, it would try to write to minCosts[stoneCount+2].
    // This ensures NaN propagation matches the original's array sizing and behavior.
    const minCosts = new Array(stoneCount + 3).fill(Number.POSITIVE_INFINITY);
    minCosts[0] = 0; // Cost to reach the first stone (index 0) is 0.

    // Iterate through each stone from the start to calculate minimum costs
    // to reach subsequent stones. This is an iterative bottom-up dynamic programming approach.
    // The loop runs up to and including 'stoneCount' to match the original's
    // recursive calls that go up to dp(stoneCount), which then updates c[stoneCount+1] and c[stoneCount+2].
    for (let currentStoneIndex = 0; currentStoneIndex <= stoneCount; currentStoneIndex++) {
        // Calculate cost to jump to the next stone (currentStoneIndex + 1)
        // This will propagate NaN if stoneHeights[currentStoneIndex + 1] is undefined,
        // matching the original's behavior for out-of-bounds array access.
        const costToStepOne = minCosts[currentStoneIndex] + Math.abs(stoneHeights[currentStoneIndex] - stoneHeights[currentStoneIndex + 1]);
        minCosts[currentStoneIndex + 1] = Math.min(minCosts[currentStoneIndex + 1], costToStepOne);

        // Calculate cost to jump to the stone after next (currentStoneIndex + 2)
        // This will propagate NaN if stoneHeights[currentStoneIndex + 2] is undefined,
        // matching the original's behavior for out-of-bounds array access.
        const costToStepTwo = minCosts[currentStoneIndex] + Math.abs(stoneHeights[currentStoneIndex] - stoneHeights[currentStoneIndex + 2]);
        minCosts[currentStoneIndex + 2] = Math.min(minCosts[currentStoneIndex + 2], costToStepTwo);
    }

    // The result is the minimum cost to reach the last stone (index stoneCount - 1).
    console.log(minCosts[stoneCount - 1]);
};

// This line is part of the external contract and must not be changed.
processInputAndCompute(require("fs").readFileSync("/dev/stdin", "utf8"));
