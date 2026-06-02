"use strict";

const processInput = (inputContent) => {
    const inputLines = inputContent.trim().split(/\r?\n/).filter(s => s.length > 0);

    const [numN, numK] = inputLines[0].split(" ").map(Number);
    // Note: The original code parses inputLines[1] twice: once as stepValues and once as rangePairs[0].
    // This behavior is preserved for strict equivalence, even if it seems unusual.
    const stepValues = inputLines[1].split(" ").map(Number); // This variable is unused in the original logic.
    const rangePairs = inputLines.slice(1, numN + 1).map(line => line.split(" ").map(Number));

    const MODULUS = 998244353;

    // --- Part 1: Determine active indices using a difference map (Type IV: Map instead of Array) ---
    const differenceMap = new Map();
    for (let i = 0; i < numK; i++) { // Loop uses numK, not numN, as per original code.
        const [leftBound, rightBound] = rangePairs[i];
        differenceMap.set(leftBound, (differenceMap.get(leftBound) || 0) + 1);
        differenceMap.set(rightBound + 1, (differenceMap.get(rightBound + 1) || 0) - 1);
    }

    const activeIndices = [];
    let currentCoverageLevel = 0;
    for (let idx = 0; idx < numN; idx++) {
        const changeAtIdx = differenceMap.get(idx) || 0;
        // Divergent syntax for updating coverage level
        if (changeAtIdx === 1) {
            currentCoverageLevel++;
        } else if (changeAtIdx === -1) {
            currentCoverageLevel--;
        }
        if (currentCoverageLevel > 0) {
            activeIndices.push(idx);
        }
    }

    // --- Part 2: Dynamic Programming (Type IV: Array.prototype.reduce for inner sum) ---
    const waysToReach = Array(numN).fill(0);
    waysToReach[0] = 1; // Base case: one way to reach index 0

    for (let currentIdx = 1; currentIdx < numN; currentIdx++) {
        // Use Array.prototype.reduce for the inner summation,
        // replacing the original's imperative inner for loop.
        waysToReach[currentIdx] = activeIndices.reduce((accumulator, offset) => {
            const previousIdx = currentIdx - offset;
            // Check for valid previous index and if it's reachable (waysToReach[previousIdx] > 0)
            // This replaces the original's `dp[i - hoge] > 0 && dp[i - hoge] !== Infinity`
            // since waysToReach is initialized to 0 instead of Infinity.
            if (previousIdx >= 0 && waysToReach[previousIdx] > 0) {
                return (accumulator + waysToReach[previousIdx]) % MODULUS;
            }
            return accumulator;
        }, 0);
    }

    console.log(waysToReach[numN - 1]);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
