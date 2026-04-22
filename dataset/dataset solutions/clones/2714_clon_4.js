function processInputData(inputSource) {
    const inputLines = inputSource.split("\n");
    const initialSequence = inputLines[0];
    const targetFragment = inputLines[1];

    const sequenceLength = initialSequence.length;
    const fragmentLength = targetFragment.length;

    // Handle specific edge cases for empty strings to match original behavior
    if (fragmentLength === 0) {
        // If the target fragment is empty, it matches at every position.
        // Advancing by 0 positions will always create an infinite loop unless the sequence itself is empty.
        return sequenceLength === 0 ? 0 : -1;
    }
    if (sequenceLength === 0) {
        // If the initial sequence is empty, no matches are possible, so the max chain length is 0.
        return 0;
    }

    // Step 1: Determine all starting positions in the 'initialSequence' where 'targetFragment' occurs.
    // The original code uses `(s+t).slice(i, i+t.length)`. This effectively checks for matches
    // in the string formed by concatenating 'initialSequence' with 'targetFragment'.
    // This handles wrapping behavior where the match might span across the end of 'initialSequence'
    // and take characters from the beginning of 'targetFragment'.
    const combinedSearchSpace = initialSequence + targetFragment;
    const validStartingPoints = new Set(
        Array.from({ length: sequenceLength }, (_, k) => k).filter(
            idx => combinedSearchSpace.slice(idx, idx + fragmentLength) === targetFragment
        )
    );

    let overallMaximumChain = 0;
    const computedChainLengths = new Map(); // Memoization cache for storing computed chain lengths
    const CYCLE_INDICATOR = Symbol('cycle_detected'); // Special symbol to mark a detected cycle

    // Recursive function to compute the length of a chain starting at 'currentPosition'.
    // It also detects cycles within the chain using 'activePathTrace'.
    function computeChainLength(currentPosition, activePathTrace) {
        // Base case 1: If the 'currentPosition' is not a valid starting point for 'targetFragment',
        // the chain ends here, contributing 0 to the length.
        if (!validStartingPoints.has(currentPosition)) {
            return 0;
        }

        // Base case 2: Cycle detection - if 'currentPosition' is already present in 'activePathTrace',
        // it signifies that we have encountered a cycle in the current path.
        if (activePathTrace.has(currentPosition)) {
            return CYCLE_INDICATOR;
        }

        // Base case 3: Memoization - If the length for 'currentPosition' has been computed previously,
        // return the cached value to avoid redundant calculations.
        if (computedChainLengths.has(currentPosition)) {
            return computedChainLengths.get(currentPosition);
        }

        // Recursive step:
        // Mark 'currentPosition' as part of the active path to detect cycles.
        activePathTrace.add(currentPosition);

        // Calculate the next position in the chain by advancing 'fragmentLength' steps circularly.
        const nextPosition = (currentPosition + fragmentLength) % sequenceLength;

        // Recursively determine the length of the chain starting from 'nextPosition'.
        const lengthFromNext = computeChainLength(nextPosition, activePathTrace);

        // Backtrack: Remove 'currentPosition' from the active path as the recursion unwinds.
        activePathTrace.delete(currentPosition);

        // If the recursive call detected a cycle, propagate this information.
        if (lengthFromNext === CYCLE_INDICATOR) {
            computedChainLengths.set(currentPosition, CYCLE_INDICATOR); // Cache the cycle result
            return CYCLE_INDICATOR;
        }

        // The length of the chain starting at 'currentPosition' is 1 (for the current match)
        // plus the length of the chain extending from 'nextPosition'.
        const currentChainValue = 1 + lengthFromNext;
        computedChainLengths.set(currentPosition, currentChainValue); // Cache the computed length
        return currentChainValue;
    }

    // Step 2: Iterate through all possible starting indices in 'initialSequence' to find
    // the longest chain of 'targetFragment' occurrences.
    for (let k = 0; k < sequenceLength; ++k) {
        // 'new Set()' is passed for 'activePathTrace' for each top-level call to ensure
        // cycle detection is specific to the current chain being explored from 'k'.
        const currentChainResult = computeChainLength(k, new Set());

        if (currentChainResult === CYCLE_INDICATOR) {
            // If any chain leads to an infinite loop (cycle), the overall result is -1.
            overallMaximumChain = -1;
            break; // No need to check further, an infinite chain exists.
        } else {
            // Update the overall maximum chain length found so far.
            overallMaximumChain = Math.max(overallMaximumChain, currentChainResult);
        }
    }

    return overallMaximumChain;
}

// Standard input reading mechanism as provided in the original problem context.
const programInput = require("fs").readFileSync("/dev/stdin", "utf8");
console.log(processInputData(programInput));