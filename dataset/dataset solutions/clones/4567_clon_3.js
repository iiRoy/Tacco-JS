/**
 * This JavaScript module is designed to compute the minimal difference between
 * the largest and smallest areas when a rectangular shape is divided into three
 * distinct pieces. It considers various cutting strategies and orientations.
 *
 * The problem involves finding the optimal way to slice a rectangle of given
 * dimensions (width and height) into three sub-rectangles such that the
 * absolute difference between the largest and smallest area among these three
 * sub-rectangles is minimized.
 */

/**
 * Processes the raw input string containing rectangle dimensions, performs
 * the necessary calculations, and outputs the resulting minimum area difference.
 *
 * @param {string} rawInputString - A string containing two space-separated
 *                                  positive integers representing the width
 *                                  and height of the rectangle.
 */
function calculateOptimalRectangleSplit(rawInputString) {
    // --- Phase 1: Input Parsing and Initial Validation ---
    if (typeof rawInputString !== 'string' || rawInputString.trim() === '') {
        console.error("Input error: The provided data is not a valid string or is empty.");
        return; // Terminate execution if input is unusable.
    }

    const dimensionStrings = rawInputString.trim().split(" ");

    if (dimensionStrings.length !== 2) {
        console.error(`Input error: Expected exactly two numerical dimensions, but found ${dimensionStrings.length}.`);
        return;
    }

    const rectWidth = Number(dimensionStrings[0]);
    const rectHeight = Number(dimensionStrings[1]);

    if (isNaN(rectWidth) || isNaN(rectHeight) || rectWidth <= 0 || rectHeight <= 0) {
        console.error("Input error: Both dimensions must be positive numerical values.");
        return;
    }

    // Initialize the tracker for the smallest area difference found across all strategies.
    let overallSmallestDifference = Number.MAX_SAFE_INTEGER;

    /**
     * A reusable utility function to evaluate two primary cutting patterns for a given
     * set of rectangle dimensions (dimensionX, dimensionY). It calculates the difference
     * between the max and min areas among the three resulting pieces.
     *
     * The cutting patterns are:
     * 1. Split dimensionX into `floor(dimensionX/3)` and `(dimensionX - floor(dimensionX/3))`.
     *    The first part forms one piece (`floor(dimensionX/3) * dimensionY`).
     *    The remaining part `(dimensionX - floor(dimensionX/3))` is then split along
     *    dimensionY into two halves (`ceil(dimensionY/2)` and `floor(dimensionY/2)`).
     * 2. Similar to (1), but using `ceil(dimensionX/3)` for the first piece.
     *
     * @param {number} dimensionX - The dimension along which the initial cut is made.
     * @param {number} dimensionY - The other dimension, used for subsequent bisection.
     * @returns {number} The minimal area difference achieved with these two strategies
     *                   for the given (dimensionX, dimensionY) orientation.
     */
    const computeSplitConfigurationDifference = (dimensionX, dimensionY) => {
        let configurationMinDifference = Number.MAX_SAFE_INTEGER;

        // --- Strategy A: Initial cut uses floor(dimensionX / 3) ---
        const segmentX_A1 = Math.floor(dimensionX / 3);
        const areaPiece1_A = segmentX_A1 * dimensionY;

        // The remaining segment of dimensionX is then divided along dimensionY.
        const remainingX_A = dimensionX - segmentX_A1; // This is equivalent to Math.ceil(dimensionX / 3 * 2)
        const areaPiece2_A = remainingX_A * Math.ceil(dimensionY / 2);
        const areaPiece3_A = remainingX_A * Math.floor(dimensionY / 2);

        // Calculate the max-min difference for this specific set of areas.
        const currentAreasA = [areaPiece1_A, areaPiece2_A, areaPiece3_A];
        configurationMinDifference = Math.min(
            configurationMinDifference,
            Math.max(...currentAreasA) - Math.min(...currentAreasA)
        );

        // --- Strategy B: Initial cut uses ceil(dimensionX / 3) ---
        const segmentX_B1 = Math.ceil(dimensionX / 3);
        const areaPiece1_B = segmentX_B1 * dimensionY;

        // The remaining segment of dimensionX is then divided along dimensionY.
        const remainingX_B = dimensionX - segmentX_B1; // This is equivalent to Math.floor(dimensionX / 3 * 2)
        const areaPiece2_B = remainingX_B * Math.ceil(dimensionY / 2);
        const areaPiece3_B = remainingX_B * Math.floor(dimensionY / 2);

        // Calculate the max-min difference for this specific set of areas.
        const currentAreasB = [areaPiece1_B, areaPiece2_B, areaPiece3_B];
        configurationMinDifference = Math.min(
            configurationMinDifference,
            Math.max(...currentAreasB) - Math.min(...currentAreasB)
        );

        return configurationMinDifference;
    };

    // --- Phase 2: Apply Cutting Strategies for Both Orientations ---
    // First, consider `rectWidth` as the dimension along which the initial 1/3 cut is made.
    overallSmallestDifference = Math.min(
        overallSmallestDifference,
        computeSplitConfigurationDifference(rectWidth, rectHeight)
    );

    // Second, swap the dimensions. Consider `rectHeight` as the dimension along which
    // the initial 1/3 cut is made. This effectively covers the original code's `x = y + (y=x,0)` swap.
    overallSmallestDifference = Math.min(
        overallSmallestDifference,
        computeSplitConfigurationDifference(rectHeight, rectWidth)
    );

    // --- Phase 3: Special Case Handling for Divisibility by 3 ---
    // If either dimension is perfectly divisible by 3, it's possible to divide the
    // rectangle into three equal strips. In this ideal scenario, the difference
    // between the largest and smallest area will be zero.
    if (rectWidth % 3 === 0 || rectHeight % 3 === 0) {
        overallSmallestDifference = 0;
    } else {
        // If neither dimension is divisible by 3, the minimum difference might be
        // one of the dimensions themselves. This often applies when one dimension
        // is very small (e.g., 1 or 2), limiting the ways to cut.
        // For example, if width is 1, you can't cut it into three pieces along width.
        // The best difference might be the height if you cut a 1xHeight strip.
        overallSmallestDifference = Math.min(overallSmallestDifference, rectWidth);
        overallSmallestDifference = Math.min(overallSmallestDifference, rectHeight);
    }

    // --- Phase 4: Output the Final Result ---
    console.log(overallSmallestDifference);
}

// Entry point for execution: Reads input from standard input (e.g., a file)
// and passes it to the main processing function.
// The `.trim()` method is crucial to remove any potential leading/trailing
// whitespace (like newlines) from the input string.
calculateOptimalRectangleSplit(require("fs").readFileSync("/dev/stdin", "utf8").trim());