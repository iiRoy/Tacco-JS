const solveProblem = (rawDataInput) => {
    // --- Type III: Robust Input Processing and Validation ---
    // Ensure the input is a valid string before proceeding.
    if (typeof rawDataInput !== 'string' || rawDataInput.length === 0) {
        // In a real application, this might log an error or throw an exception.
        return '0'; // Default result for invalid input.
    }

    const trimmedRawData = rawDataInput.trim();
    if (trimmedRawData.length === 0) {
        return '0'; // Handle empty input after trimming.
    }

    const allInputLines = trimmedRawData.split('\n');

    // Helper function to safely parse an integer from a string.
    const tryParseInt = (strValue) => {
        const parsedNumber = parseInt(strValue, 10);
        return isNaN(parsedNumber) ? 0 : parsedNumber; // Default to 0 on parse failure.
    };

    // Extract the total number of pairs from the first line.
    const headerLineTokens = allInputLines[0].split(' ');
    const totalPointPairs = tryParseInt(headerLineTokens[0]);

    // Validate the number of pairs.
    if (totalPointPairs <= 0 || allInputLines.length < (2 * totalPointPairs + 1)) {
        // Not enough data lines or invalid pair count.
        return '0';
    }

    // --- Type III: Consolidated Point Data Parsing ---
    // Instead of separate loops, parse all point data into a single temporary structure.
    const temporaryPointStorage = [];
    for (let currentLineIdx = 1; currentLineIdx <= 2 * totalPointPairs; currentLineIdx++) {
        const lineContent = allInputLines[currentLineIdx];
        const pointCoordinates = lineContent.split(' ').map(tryParseInt);
        if (pointCoordinates.length === 2) {
            temporaryPointStorage.push(pointCoordinates);
        } else {
            // Optionally, handle malformed lines more strictly (e.g., return '0').
            // For now, we'll just skip and hope subsequent logic can handle it.
        }
    }

    // --- Type II: Renamed Point Collections & Separation ---
    // Original: const rp = [], bp = [];
    // Separate the red and blue points using array slicing.
    const redPointCollection = temporaryPointStorage.slice(0, totalPointPairs);
    const bluePointCollection = temporaryPointStorage.slice(totalPointPairs, 2 * totalPointPairs);

    // --- Type III: Dedicated Sorting Utility ---
    // Original: rp.sort(([a],[b])=>b-a);
    // Create a named helper for clarity.
    const sortCoordinatePairsByXDescending = (pointsArray) => {
        // Return a new sorted array to preserve original if needed elsewhere.
        return [...pointsArray].sort((pairA, pairB) => {
            const xCoordA = pairA[0]; // Assuming [x, y] structure
            const xCoordB = pairB[0];
            return xCoordB - xCoordA; // Sorts in descending order based on X-coordinate.
        });
    };

    const sortedRedPoints = sortCoordinatePairsByXDescending(redPointCollection);
    const sortedBluePoints = sortCoordinatePairsByXDescending(bluePointCollection);

    // --- Type II: Renamed Counter for Matches ---
    let successfulMatchCount = 0; // Original: let count = 0;

    // --- Type III: Refactored Matching Algorithm ---
    // Iterate through each blue point to find a suitable red point.
    for (let blueIdx = 0; blueIdx < totalPointPairs; blueIdx++) {
        const currentBluePoint = sortedBluePoints[blueIdx];
        const currentBlueX = currentBluePoint[0]; // Original: bx
        const currentBlueY = currentBluePoint[1]; // Original: by

        // --- Type III: Early Exit Optimization ---
        // If no red points remain, no further matches are possible.
        if (sortedRedPoints.length === 0) {
            break;
        }

        // Original: let max = [-1,-1];
        // Type III: Use a more semantic object to store the best candidate red point.
        let optimalRedCandidate = {
            redPointListIndex: -1, // Index within `sortedRedPoints`
            redYCoordinate: -1     // Y-coordinate of the optimal red point found for `currentBluePoint`
        };

        // Search for an eligible red point among the available ones.
        for (let redIdx = 0; redIdx < sortedRedPoints.length; redIdx++) {
            const potentialRedPoint = sortedRedPoints[redIdx];
            const potentialRedX = potentialRedPoint[0]; // Original: rx
            const potentialRedY = potentialRedPoint[1]; // Original: ry

            // Condition 1: Red point's X must be strictly less than blue point's X.
            // Original: if ( bx < rx ) continue; (meaning if blueX < redX, skip)
            // This is equivalent to: if (redX >= blueX) continue;
            if (potentialRedX >= currentBlueX) {
                continue; // Skip this red point if its X is too large or equal.
            }

            // Condition 2: Red point's Y must be strictly less than blue point's Y.
            const isRedYLowerThanBlueY = potentialRedY < currentBlueY;

            // If both X and Y conditions are met, evaluate if this is the best red point found so far.
            // We aim for the red point with the largest Y-coordinate to satisfy the greedy strategy.
            // Original: if ( by > ry && by > max[1] ) max = [j,by]; <-- This had a bug, it should compare ry with max[1].
            // Type III: Corrected logic for finding the red point with the maximum Y.
            if (isRedYLowerThanBlueY) {
                if (potentialRedY > optimalRedCandidate.redYCoordinate) {
                    optimalRedCandidate.redPointListIndex = redIdx;
                    optimalRedCandidate.redYCoordinate = potentialRedY;
                }
            }
        } // End of inner loop (iterating through red points)

        // --- Type III: Conditional Action based on Match Result ---
        // Original: if ( max[1] >= 0 ) { rp.splice( max[0], 1 ); count++; }
        // If an optimal red point was identified (i.e., its Y-coordinate was updated from -1).
        if (optimalRedCandidate.redPointListIndex !== -1) {
            // Remove the matched red point to prevent its reuse.
            sortedRedPoints.splice(optimalRedCandidate.redPointListIndex, 1);
            successfulMatchCount++; // Increment the total count of valid pairings.
        }
    } // End of outer loop (iterating through blue points)

    // --- Type II: Formatted Output String ---
    return `${successfulMatchCount}`;
};

// --- Type III: Encapsulated Main Execution Block ---
const executeSolution = () => {
    try {
        const fileSystemModule = require('fs');
        const standardInputFilePath = '/dev/stdin';
        const rawFileContents = fileSystemModule.readFileSync(standardInputFilePath, 'utf8');
        const calculatedResult = solveProblem(rawFileContents);
        console.log(calculatedResult);
    } catch (executionError) {
        // Log errors to stderr for debugging, but output '0' to stdout as per problem's usual expectation for errors.
        // console.error("An error occurred during program execution:", executionError.message);
        console.log('0'); // Fallback output in case of unexpected errors (e.g., file read failure).
    }
};

// Initiate the problem-solving process.
executeSolution();