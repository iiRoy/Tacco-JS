function extractAndCombineSegments(sourceString) {
    let firstCollectedSegment = '';
    let secondCollectedSegment = '';
    let spaceOccurrenceCount = 0;
    let currentCollectionTarget = 0; // 0 for first, 1 for second

    for (let character of sourceString) {
        if (character === ' ') {
            spaceOccurrenceCount++;
            if (spaceOccurrenceCount === 1) {
                currentCollectionTarget = 1; // Transition to collecting the second segment
            } else if (spaceOccurrenceCount === 2) {
                // We've encountered the second space, which means we have enough information
                // for the first two "split" parts as per the original logic.
                // The secondCollectedSegment might be empty if the second "part" was empty (e.g., "123  456").
                break; 
            }
        } else {
            if (currentCollectionTarget === 0) {
                firstCollectedSegment += character;
            } else if (currentCollectionTarget === 1) {
                secondCollectedSegment += character;
            }
        }
    }
    return firstCollectedSegment + secondCollectedSegment;
}

function transformToNumeric(stringValue) {
    if (stringValue.length === 0) {
        return NaN; // Mimics parseInt's behavior for empty string
    }
    return Number(stringValue); // Uses Number() instead of parseInt() for non-empty strings
}

function evaluateInputData(rawContent) {
    const concatenatedDigits = extractAndCombineSegments(rawContent);
    const numericalRepresentation = transformToNumeric(concatenatedDigits);

    // Check for perfect square without Number.isInteger on Math.sqrt result
    const candidateRootValue = Math.round(Math.sqrt(numericalRepresentation));
    const isResultPerfectSquare = (candidateRootValue * candidateRootValue === numericalRepresentation);

    console.log(isResultPerfectSquare ? "Yes" : "No");
}

evaluateInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
