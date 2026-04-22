function ProcessInput(rawDataString) {
    if (!rawDataString || rawDataString.trim() === "") {
        console.error("Error: Input data is empty. Please provide valid dimensions.");
        return;
    }

    const parsedInputLines = rawDataString
        .trim()
        .split("\n")
        .map(lineContent => lineContent.split(" "));

    if (!parsedInputLines[0] || parsedInputLines[0].length < 2) {
        console.error("Error: Invalid input structure. Expected two space-separated numbers on the first line.");
        return;
    }

    const primaryDimensionValue = parseInt(parsedInputLines[0][0], 10);
    const secondaryDimensionValue = parseInt(parsedInputLines[0][1], 10);

    if (isNaN(primaryDimensionValue) || isNaN(secondaryDimensionValue) || primaryDimensionValue <= 0 || secondaryDimensionValue <= 0) {
        console.error("Error: Dimensions must be positive integer values.");
        return;
    }

    const finalMinimumAreaDifference = computeOptimalAreaDifference(primaryDimensionValue, secondaryDimensionValue);

    console.log(finalMinimumAreaDifference);
}

// This helper function determines the maximum area difference when a rectangle
// of `totalLength` by `fixedWidth` is split into three pieces.
// The first piece is `cutPoint` by `fixedWidth`.
// The remaining `(totalLength - cutPoint)` by `fixedWidth` piece is then
// split perpendicularly (along `fixedWidth`) into two pieces.
function calculatePerpendicularSplitDifference(cutPoint, totalLength, fixedWidth) {
    // Area of the first piece (cut along the totalLength dimension)
    const firstPieceArea = cutPoint * fixedWidth;

    // Remaining length of the primary dimension after the first cut
    const remainingLength = totalLength - cutPoint;

    // The remaining rectangle `remainingLength` x `fixedWidth` is split into two pieces
    // along its `fixedWidth` dimension. To minimize difference, we split it as evenly as possible.
    const secondPieceArea = remainingLength * Math.floor(fixedWidth / 2);
    const thirdPieceArea = remainingLength * Math.ceil(fixedWidth / 2);

    // Determine the largest and smallest areas among the three pieces
    const largestArea = Math.max(firstPieceArea, secondPieceArea, thirdPieceArea);
    const smallestArea = Math.min(firstPieceArea, secondPieceArea, thirdPieceArea);

    // The result for this split configuration is the difference between the largest and smallest piece
    return largestArea - smallestArea;
}

// This function iterates through all possible initial cut points for a given
// orientation (primaryDim, secondaryDim) and finds the minimum maximum difference.
function analyzeSplitsForOrientation(primaryDim, secondaryDim) {
    let currentMinimumDifference = Infinity; // Initialize with a very large value
    let lastIterationDifference = Infinity;   // Used for the optimization to break early

    // Iterate through all possible positions for the first cut.
    // A cut at `0` means the first piece has 0 area. A cut at `primaryDim` means the remaining piece has 0 length.
    for (let cutPosition = 0; cutPosition <= primaryDim; cutPosition++) {
        const calculatedDifferenceForCurrentCut = calculatePerpendicularSplitDifference(
            cutPosition,
            primaryDim,
            secondaryDim
        );

        // Update the overall minimum difference found so far for this orientation
        currentMinimumDifference = Math.min(currentMinimumDifference, calculatedDifferenceForCurrentCut);

        // Optimization: If the difference starts increasing, it implies we've passed the optimal cut point
        // (assuming the function behaves somewhat convex-like), so further iterations won't yield better results.
        if (calculatedDifferenceForCurrentCut > lastIterationDifference) {
            break;
        }
        // Store the current difference for comparison in the next iteration
        lastIterationDifference = calculatedDifferenceForCurrentCut;
    }
    return currentMinimumDifference;
}

// The core function to compute the minimum possible maximum area difference
// when dividing a rectangle of `dimA` x `dimB` into three pieces.
function computeOptimalAreaDifference(dimA, dimB) {
    // Initial and most efficient check: if either dimension is perfectly divisible by 3,
    // it's possible to make two parallel cuts yielding three identical pieces.
    // In this ideal scenario, the maximum difference between pieces is 0.
    if (dimA % 3 === 0 || dimB % 3 === 0) {
        return 0;
    }

    // Initialize the overall minimum difference found.
    // The worst-case difference is the total area itself (e.g., if two pieces are 0).
    let globalMinDifference = dimA * dimB;

    // Strategy 1: Consider the first cut along `dimA`, and the second cut perpendicular (along `dimB`).
    globalMinDifference = Math.min(
        globalMinDifference,
        analyzeSplitsForOrientation(dimA, dimB)
    );

    // Strategy 2: Consider the first cut along `dimB`, and the second cut perpendicular (along `dimA`).
    // This effectively swaps the roles of the dimensions and re-runs the same logic.
    globalMinDifference = Math.min(
        globalMinDifference,
        analyzeSplitsForOrientation(dimB, dimA)
    );

    // Final adjustment for edge cases:
    // If one of the dimensions is very small (e.g., 1 or 2), it might be impossible
    // to make effective cuts, and the minimum possible difference might simply be
    // the value of that small dimension itself. This catches cases where the
    // `analyzeSplitsForOrientation` might yield a larger value for very small
    // dimensions than the dimension itself implies as a minimal possible difference.
    // For example, if H=1, W=5, the loops might suggest 3, but the answer is 1.
    return Math.min(globalMinDifference, dimA, dimB);
}

// Standard competitive programming entry point: reads from stdin
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));