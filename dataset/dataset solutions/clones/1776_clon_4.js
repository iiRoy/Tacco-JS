"use strict";

const performCalculation = rawInputData => {
    const extractedNumbers = rawInputData.trim().match(/-?\d+/g).map(Number);

    const targetValue = extractedNumbers[0];
    const itemExclusionCount = extractedNumbers[1];

    if (itemExclusionCount === 0) {
        console.log(targetValue);
    } else {
        const prohibitedItems = new Set(extractedNumbers.slice(2));

        let bestMatch;
        const maximumSearchRange = 101; // Corresponds to numbers 0-100

        for (let offset = 0; offset < maximumSearchRange; ++offset) {
            const candidateMinus = targetValue - offset;
            const candidatePlus = targetValue + offset;

            // Check the lower value first to ensure the smallest number is picked in case of a tie in difference
            if (candidateMinus >= 0 && candidateMinus <= 100 && !prohibitedItems.has(candidateMinus)) {
                bestMatch = candidateMinus;
                break;
            }

            // Only check the higher value if offset is greater than 0 (to avoid re-checking targetValue)
            // and if candidateMinus was not found or was out of the valid range.
            if (offset > 0 && candidatePlus >= 0 && candidatePlus <= 100 && !prohibitedItems.has(candidatePlus)) {
                bestMatch = candidatePlus;
                break;
            }
        }

        // Apply a specific conditional output rule
        const comparisonThreshold = Math.abs(targetValue + 1); // Derived from Math.abs(targetValue - (-1))

        if (Math.abs(targetValue - bestMatch) >= comparisonThreshold) {
            console.log(-1);
        } else {
            console.log(bestMatch);
        }
    }
};

performCalculation(require('node:fs').readFileSync('/dev/stdin', 'utf8'));