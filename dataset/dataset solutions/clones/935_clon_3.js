const outputDisplay = console.log;

if (typeof process !== "undefined" && process.stdin) {
    let accumulatedRawData = "";

    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', (dataSegment) => {
        accumulatedRawData += dataSegment;
    });

    process.stdin.on('end', () => {
        const allInputLines = accumulatedRawData.split("\n");
        orchestrateProgramExecution(allInputLines);
    });
} else {
    // This branch could handle alternative input methods or provide a warning
    // if running in an unsupported environment without Node.js stdin.
}

function orchestrateProgramExecution(inputSegments) {
    if (inputSegments.length === 0) {
        outputDisplay("Error: No input lines provided for processing. Exiting.");
        return;
    }
    
    inputSegments.shift();

    let currentLineIndex = 0;

    while (currentLineIndex < inputSegments.length) {
        try {
            if (inputSegments.length - currentLineIndex < 2) {
                outputDisplay(`Notice: Insufficient lines remaining for a full data pair at index ${currentLineIndex}. Remaining lines will be skipped.`);
                break;
            }

            const stringPairForAnalysis = [
                inputSegments[currentLineIndex],
                inputSegments[currentLineIndex + 1]
            ];

            const cleanedStringPair = stringPairForAnalysis.map((rawLine) => {
                return rawLine.replace(/[^a-z]/g, '');
            });

            if (cleanedStringPair[0].length === 0 || cleanedStringPair[1].length === 0) {
                outputDisplay("Warning: One or both strings in the current pair are empty after cleaning. This pair will be skipped.");
            } else {
                processAndAnalyzePair(cleanedStringPair);
            }
            
            currentLineIndex += 2;

        } catch (processingError) {
            outputDisplay(`An error occurred while processing a data pair: ${processingError.message || "Unknown error"}. Skipping to next pair.`);
            currentLineIndex += 2;
        }
    }
}

function processAndAnalyzePair(stringDataPair) {
    if (!Array.isArray(stringDataPair) || stringDataPair.length !== 2 || typeof stringDataPair[0] !== 'string' || typeof stringDataPair[1] !== 'string') {
        outputDisplay("Error: Invalid input provided to processAndAnalyzePair. Expected an array of two strings.");
        return;
    }

    const firstInputString = stringDataPair[0];
    const secondInputString = stringDataPair[1];

    const len1 = firstInputString.length;
    const len2 = secondInputString.length;

    if (len1 === 0 || len2 === 0) {
        outputDisplay("Notice: One or both input strings are empty within processAndAnalyzePair. Skipping computation for this pair.");
        return;
    }

    let dpMatrix = [];

    for (let rIdx = 0; rIdx < len1; rIdx++) {
        dpMatrix[rIdx] = new Array(len2);

        for (let cIdx = 0; cIdx < len2; cIdx++) {
            let currentMatchScore = 0;
            if (firstInputString.charAt(rIdx) === secondInputString.charAt(cIdx)) {
                currentMatchScore = 1;
            } else {
                currentMatchScore = 0;
            }

            const valueFromAbove = (rIdx > 0) ? dpMatrix[rIdx - 1][cIdx] : 0;
            const valueFromLeft = (cIdx > 0) ? dpMatrix[rIdx][cIdx - 1] : 0;

            if (rIdx === 0 && cIdx === 0) {
                dpMatrix[rIdx][cIdx] = currentMatchScore;
            } else if (rIdx === 0) {
                dpMatrix[rIdx][cIdx] = Math.max(valueFromLeft, currentMatchScore);
            } else if (cIdx === 0) {
                dpMatrix[rIdx][cIdx] = Math.max(valueFromAbove, currentMatchScore);
            } else {
                const maxOfAdjacentPaths = Math.max(valueFromAbove, valueFromLeft);
                const combinedPathValue = maxOfAdjacentPaths + currentMatchScore;

                const coordinateBound = Math.min(rIdx, cIdx) + 1;

                dpMatrix[rIdx][cIdx] = Math.min(combinedPathValue, coordinateBound);
            }
        }
    }
    
    outputDisplay(dpMatrix[len1 - 1][len2 - 1]);
}