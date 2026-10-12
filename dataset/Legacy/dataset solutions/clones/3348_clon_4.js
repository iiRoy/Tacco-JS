'use strict';

function processInputAndSolve(rawInput) {
    const lines = rawInput.trim().split(/\n/);
    const numEntities = parseInt(lines.shift(), 10);
    const moduloConstant = Math.pow(10, 9) + 7;

    const compatibilityMatrix = lines.map(str =>
        str.split(/\s+/).map(x => parseInt(x, 10))
    );

    const memoizationTable = Array.from({ length: numEntities }, () =>
        Array(1 << numEntities).fill(-1)
    );

    function calculateMatchings(currentMan, matchedWomenMask) {
        if (currentMan === numEntities) {
            return 1;
        }

        if (memoizationTable[currentMan][matchedWomenMask] !== -1) {
            return memoizationTable[currentMan][matchedWomenMask];
        }

        let totalWaysForCurrentMan = 0;

        for (let womanIndex = 0; womanIndex < numEntities; womanIndex++) {
            const isWomanAvailable = !((matchedWomenMask >> womanIndex) & 1);
            const isCompatible = compatibilityMatrix[currentMan][womanIndex] === 1;

            if (isWomanAvailable && isCompatible) {
                const nextMatchedWomenMask = matchedWomenMask | (1 << womanIndex);
                totalWaysForCurrentMan = (
                    totalWaysForCurrentMan +
                    calculateMatchings(currentMan + 1, nextMatchedWomenMask)
                ) % moduloConstant;
            }
        }

        memoizationTable[currentMan][matchedWomenMask] = totalWaysForCurrentMan;
        return totalWaysForCurrentMan;
    }

    const finalResult = calculateMatchings(0, 0);
    console.log(finalResult);
}

processInputAndSolve(require('fs').readFileSync('/dev/stdin', 'utf8'));
