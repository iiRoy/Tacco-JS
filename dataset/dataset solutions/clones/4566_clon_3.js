"use strict";

// A utility function to compute the difference between the maximum and minimum values
// within a collection of numerical area segments. This helps in evaluating the "spread"
// of the areas after a division.
const calculateAreaMagnitudeDelta = (areaSegments) => {
    // Filter out any non-numeric or invalid entries to ensure robust sorting.
    // This is a defensive programming addition (Type III).
    const validAreas = areaSegments.filter(val => typeof val === 'number' && !isNaN(val));

    // If we don't have enough valid segments, it implies a calculation error or
    // an invalid division, so return a very large value to indicate a poor outcome.
    if (validAreas.length < 3) {
        return Number.POSITIVE_INFINITY;
    }

    // Sort the areas in ascending order to easily identify the smallest and largest.
    validAreas.sort((valA, valB) => valA - valB);

    // The delta is the difference between the largest and smallest segment areas.
    return validAreas[2] - validAreas[0];
};

// The primary function responsible for processing the input and determining
// the optimal rectangle division strategy.
const analyzeRectangleDivision = (rawInputContent) => {
    // Extract numerical dimensions from the raw input string.
    // The input is expected to be a single line containing two space-separated integers.
    const dimensionTokens = rawInputContent.trim().split("\n")[0].split(" ");

    // Convert string tokens to numbers. Using Number() is a clear conversion.
    let primaryDimension = Number(dimensionTokens[0]); // Corresponds to H in original
    let secondaryDimension = Number(dimensionTokens[1]); // Corresponds to W in original

    // Input validation: Ensure dimensions are positive integers. This is a Type III addition
    // for robustness, as competitive programming problems often guarantee valid input.
    if (isNaN(primaryDimension) || isNaN(secondaryDimension) || primaryDimension < 1 || secondaryDimension < 1) {
        console.error("Error: Invalid dimensions provided. Expected positive integers.");
        return; // Terminate if input is malformed.
    }

    // Initialize the best (minimum) area spread found so far to an extremely large value.
    let optimalAreaSpread = Number.POSITIVE_INFINITY;

    // The problem requires checking divisions for two orientations: (H, W) and (W, H).
    // We can achieve this by iterating twice and swapping dimensions.
    // Using an array to hold the current [height, width] pair simplifies the swap.
    let currentRectangleDimensions = [primaryDimension, secondaryDimension];

    // Loop through the two possible orientations of the rectangle.
    for (let orientationIteration = 0; orientationIteration < 2; ++orientationIteration) {
        const currentRectHeight = currentRectangleDimensions[0];
        const currentRectWidth = currentRectangleDimensions[1];
        const totalRectangleArea = currentRectHeight * currentRectWidth;

        // Iterate through all possible positions for the first major cut along the height.
        // A cut at `cutY` means the first piece has height `cutY`.
        // `cutY` must be at least 1, and leave at least 1 unit for the remaining height.
        for (let cutYPosition = 1; cutYPosition < currentRectHeight; ++cutYPosition) {
            const remainingHeight = currentRectHeight - cutYPosition;

            // --- Division Strategy Alpha: First cut vertical, then remaining part split vertically ---
            // This creates three segments:
            // 1. A rectangle of size `cutYPosition` x `currentRectWidth`.
            // 2. A rectangle of size `remainingHeight` x `currentRectWidth / 2`.
            // 3. The other half of the remaining part, also `remainingHeight` x `currentRectWidth / 2`.
            const segmentAlpha1 = cutYPosition * currentRectWidth;
            const segmentAlpha2 = remainingHeight * (currentRectWidth / 2);
            // The third segment's area is derived from the total area minus the first two.
            const segmentAlpha3 = totalRectangleArea - (segmentAlpha1 + segmentAlpha2);

            // Update the minimum observed area spread if this division yields a better result.
            optimalAreaSpread = Math.min(
                optimalAreaSpread,
                calculateAreaMagnitudeDelta([segmentAlpha1, segmentAlpha2, segmentAlpha3])
            );

            // --- Division Strategy Beta: First cut vertical, then remaining part split horizontally ---
            // This creates three segments:
            // 1. A rectangle of size `cutYPosition` x `currentRectWidth`.
            // 2. A rectangle of size `remainingHeight / 2` x `currentRectWidth`.
            // 3. The other half of the remaining part, also `remainingHeight / 2` x `currentRectWidth`.
            const segmentBeta1 = cutYPosition * currentRectWidth;
            const segmentBeta2 = (remainingHeight / 2) * currentRectWidth;
            // Similar to above, the third segment's area is derived.
            const segmentBeta3 = totalRectangleArea - (segmentBeta1 + segmentBeta2);

            // Update the minimum observed area spread.
            optimalAreaSpread = Math.min(
                optimalAreaSpread,
                calculateAreaMagnitudeDelta([segmentBeta1, segmentBeta2, segmentBeta3])
            );
        }

        // After evaluating all cuts for the current orientation, swap dimensions.
        // This effectively rotates the rectangle by 90 degrees for the next iteration.
        // Array destructuring provides a concise way to swap values (Type III change).
        [currentRectangleDimensions[0], currentRectangleDimensions[1]] = [currentRectangleDimensions[1], currentRectangleDimensions[0]];
    }

    // Output the final computed minimum area difference to the console.
    console.log(optimalAreaSpread);
};

// Read input from standard input and pass it to the main processing function.
analyzeRectangleDivision(require('fs').readFileSync('/dev/stdin', 'utf8'));