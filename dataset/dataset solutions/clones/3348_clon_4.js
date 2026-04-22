function computeSolution(rawData) {
    const inputLines = rawData.trim().split('\n');

    const numEntities = parseInt(inputLines[0], 10);
    const modulusConstant = 1000000007;

    const relationshipMatrix = inputLines.slice(1).map(line =>
        line.split(/\s+/).map(Number)
    );

    const memoizationStore = new Map(); // Stores results for (manIndex, womenMask) pairs

    // Recursive function to determine the number of ways to form valid pairings
    // currentManIdx: The index of the man currently being considered for a match (0 to numEntities-1)
    // matchedWomenMask: A bitmask representing which women have already been paired
    function determinePairings(currentManIdx, matchedWomenMask) {
        // Base case: If all men have been considered and successfully paired, this is one valid way
        if (currentManIdx === numEntities) {
            return 1;
        }

        // Check if this subproblem's result is already cached
        if (!memoizationStore.has(currentManIdx)) {
            memoizationStore.set(currentManIdx, new Map());
        }
        const manSpecificCache = memoizationStore.get(currentManIdx);

        if (manSpecificCache.has(matchedWomenMask)) {
            return manSpecificCache.get(matchedWomenMask);
        }

        let accumulatedWays = 0;

        // Iterate through all possible women for the current man
        for (let womanIdx = 0; womanIdx < numEntities; ++womanIdx) {
            const womanBitIdentifier = 1 << womanIdx;

            // Check if the woman is available (not yet matched)
            if ((matchedWomenMask & womanBitIdentifier) === 0) {
                // Check if the current man and this woman can be matched according to the relationship matrix
                if (relationshipMatrix[currentManIdx][womanIdx] === 1) {
                    // Recursively calculate ways for the next man, with this woman now taken
                    const waysFromThisPath = determinePairings(
                        currentManIdx + 1,
                        matchedWomenMask | womanBitIdentifier // Update the mask to include this woman
                    );
                    accumulatedWays = (accumulatedWays + waysFromThisPath) % modulusConstant;
                }
            }
        }

        // Cache the result before returning
        manSpecificCache.set(matchedWomenMask, accumulatedWays);
        return accumulatedWays;
    }

    // Initiate the pairing process starting with the first man (index 0) and no women matched (mask 0)
    return determinePairings(0, 0);
}

// Custom entry point to mimic the original's input reading
const ioModule = require('fs');
const sourceInput = ioModule.readFileSync('/dev/stdin', 'utf8');
const finalOutcome = computeSolution(sourceInput);
console.log(finalOutcome);