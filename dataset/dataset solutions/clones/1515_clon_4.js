"use strict";

const executePathCalculation = (inputRawData) => {
    const dataLines = inputRawData.trim().split("\n");
    const [totalPositions, numberOfIntervals] = dataLines[0].split(" ").map(Number);

    // The original code parses 'N' lines for LR ranges, starting from arg[1].
    // This implies that the 'K' from the first line might be ignored or N includes K.
    // Replicating the original parsing behavior:
    // `const LR = arg.slice(1, N + 1).map(n=>n.split(" ").map(l=>parseInt(l)));`
    const intervalDefinitions = dataLines.slice(1, totalPositions + 1).map(line => line.split(" ").map(Number));

    // Constructing the set of valid jump distances (equivalent to 'S' in the original)
    // Divergent strategy: instead of an imos (difference array) method,
    // we iterate through each range and explicitly add all covered indices to a Set.
    const reachableIndices = new Set();
    intervalDefinitions.forEach(currentInterval => {
        const [startPoint, endPoint] = currentInterval;
        for (let currentPoint = startPoint; currentPoint <= endPoint; currentPoint++) {
            // Ensure the point is within the bounds [0, totalPositions - 1]
            // as the DP array is 0-indexed up to totalPositions - 1.
            if (currentPoint < totalPositions) {
                reachableIndices.add(currentPoint);
            }
        }
    });

    const possibleJumps = Array.from(reachableIndices).sort((a, b) => a - b);

    const modulusValue = 998244353;

    // Dynamic programming calculation for number of ways
    // Divergent syntax: imperative outer loop combined with a functional `reduce`
    // for calculating the inner sum, and no `Infinity` initialization.
    const waysToReach = new Array(totalPositions).fill(0);
    waysToReach[0] = 1; // Base case: there is one way to reach position 0 (by not moving)

    for (let currentPosition = 1; currentPosition < totalPositions; currentPosition++) {
        waysToReach[currentPosition] = possibleJumps.reduce((cumulativeSum, jumpAmount) => {
            const previousPosition = currentPosition - jumpAmount;
            if (previousPosition >= 0) {
                // The original condition `dp[i - hoge] > 0 && dp[i-hoge] !== Infinity`
                // is implicitly handled by checking `waysToReach[previousPosition] > 0`
                // since unreachable positions are initialized to 0.
                return (cumulativeSum + waysToReach[previousPosition]) % modulusValue;
            }
            return cumulativeSum;
        }, 0); // Initial sum for the reduce operation
    }

    console.log(waysToReach[totalPositions - 1]);
};

executePathCalculation(require('fs').readFileSync('/dev/stdin', 'utf8'));