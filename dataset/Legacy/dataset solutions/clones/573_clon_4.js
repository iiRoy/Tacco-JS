const { readFileSync } = require('fs');

const processAllTestCases = () => {
    const rawInputData = readFileSync('/dev/stdin', 'utf8');
    const inputLines = rawInputData.trim().split('\n');

    let currentLineIndex = 0;

    // Helper function to apply the backward fill logic declaratively
    const applyValuePropagation = (prefixSegment, propagatingValue) => {
        const segmentLength = prefixSegment.length;
        if (segmentLength === 0) return [];

        // Find the index of the first element from the end of the prefixSegment
        // that is equal to the propagatingValue.
        let matchingElementIndex = -1;
        for (let k = segmentLength - 1; k >= 0; k--) {
            if (prefixSegment[k] === propagatingValue) {
                matchingElementIndex = k;
                break;
            }
        }

        if (matchingElementIndex === -1) {
            // If no matching element is found, the entire prefixSegment is filled with propagatingValue.
            return Array(segmentLength).fill(propagatingValue);
        } else {
            // If a matching element is found, the part up to and including it remains unchanged.
            // The part after it is filled with propagatingValue.
            const unchangedPart = prefixSegment.slice(0, matchingElementIndex + 1);
            const filledPart = Array(segmentLength - (matchingElementIndex + 1)).fill(propagatingValue);
            return [...unchangedPart, ...filledPart];
        }
    };

    // Core logic to transform a single array of stone values
    const transformStoneSequence = (stoneValues) => {
        return stoneValues.reduce((accumulatedSequence, currentStoneValue, originalIndex) => {
            const isEvenOriginalIndex = (originalIndex % 2 === 0); // Corresponds to original `flag` being true

            if (isEvenOriginalIndex) {
                // For even original indices, simply append the stone value.
                return [...accumulatedSequence, currentStoneValue];
            } else {
                // For odd original indices, apply conditional logic.
                const lastAccumulatedValue = accumulatedSequence.length > 0
                    ? accumulatedSequence[accumulatedSequence.length - 1]
                    : undefined;

                if (lastAccumulatedValue === currentStoneValue) {
                    // If the last value matches, simply append the current stone.
                    return [...accumulatedSequence, currentStoneValue];
                } else {
                    // If the last value does not match, apply the backward propagation.
                    // The propagation happens on the accumulated sequence *before* the current stone is added,
                    // and then the current stone is appended.
                    const propagatedPrefix = applyValuePropagation(accumulatedSequence, currentStoneValue);
                    return [...propagatedPrefix, currentStoneValue];
                }
            }
        }, []);
    };

    while (true) {
        const numberOfStones = parseInt(inputLines[currentLineIndex++]);
        if (numberOfStones === 0) break;

        // Extract the stone values for the current test case
        const currentStoneSet = Array.from({ length: numberOfStones }, () =>
            parseInt(inputLines[currentLineIndex++])
        );

        // Process the stone set using the transformed logic
        const finalProcessedArray = transformStoneSequence(currentStoneSet);

        // Count occurrences of zero in the final array
        const zeroOccurrences = finalProcessedArray.filter(val => val === 0).length;
        console.log(zeroOccurrences);
    }
};

processAllTestCases();
