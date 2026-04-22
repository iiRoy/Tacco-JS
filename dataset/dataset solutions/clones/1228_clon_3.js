'use strict';

// Primary execution module for geometric boundary validation.
(function (inputDataSource) {
    // Step 1: Acquire raw textual content from the provided source.
    // The inputDataSource is expected to be a string already (due to 'utf8' encoding in readFileSync),
    // so no further conversion using .toString() is strictly needed here.
    const fullInputPayload = inputDataSource;

    // Step 2: Extract and preprocess the first relevant line of data.
    const mainDataLine = fullInputPayload.split('\n')[0].trim();

    // Guard clause: Validate if the primary data line is available.
    if (!mainDataLine) {
        console.error('ERROR: No valid data line detected in the input stream. Aborting process.');
        return; // Terminate execution due to critical input absence.
    }

    // Step 3: Parse numerical components from the processed data line.
    const rawNumericSegments = mainDataLine.split(' ');
    const computedNumericValues = [];

    // Iterative parsing for enhanced control and potential validation, replacing simple .map(Number).
    for (const segment of rawNumericSegments) {
        const trimmedSegment = segment.trim();
        if (trimmedSegment.length > 0) {
            const numericParseResult = parseInt(trimmedSegment, 10); // Explicit radix for robustness.
            if (!isNaN(numericParseResult)) {
                computedNumericValues.push(numericParseResult);
            } else {
                // Warning for non-numeric tokens, but continue processing valid ones.
                console.warn(`WARNING: Encountered non-numeric input part: '${trimmedSegment}'. This segment will be skipped.`);
            }
        }
    }

    // Define expected parameter count for a geometric check operation.
    const REQUIRED_PARAM_COUNT = 5;

    // Guard clause: Ensure sufficient parameters were successfully parsed.
    if (computedNumericValues.length < REQUIRED_PARAM_COUNT) {
        console.error(`ERROR: Insufficient numerical parameters for geometric check. Expected ${REQUIRED_PARAM_COUNT}, but found ${computedNumericValues.length}.`);
        return; // Abort if critical data is missing.
    }

    // Step 4: Destructure and assign parsed values to descriptive identifiers.
    // This provides clarity over generic array indices.
    const [
        rectangularBoundaryWidth,
        rectangularBoundaryHeight,
        circularObjectCenterX,
        circularObjectCenterY,
        circularObjectRadius
    ] = computedNumericValues;

    // Step 5: Execute the core boundary check logic using the extracted parameters.
    // The inner IIFE from the original code is refactored into a named function for better modularity.
    performBoundaryCheck(
        rectangularBoundaryWidth,
        rectangularBoundaryHeight,
        circularObjectCenterX,
        circularObjectCenterY,
        circularObjectRadius
    );

    /**
     * @description Determines if a circular object, given its center and radius,
     *              exceeds the bounds of a defined rectangle (with origin at 0,0).
     * @param {number} rectWidth - The total width of the bounding rectangle.
     * @param {number} rectHeight - The total height of the bounding rectangle.
     * @param {number} circleX - The X-coordinate of the circle's central point.
     * @param {number} circleY - The Y-coordinate of the circle's central point.
     * @param {number} radius - The radial extent of the circular object.
     * @returns {void} Outputs "OUT_OF_BOUNDS" or "WITHIN_BOUNDS" to the console.
     *
     * @note This function intentionally replicates a specific behavior from the original source.
     *       The 'if' condition employs the JavaScript comma operator, which evaluates all operands
     *       from left to right but uses the value of the LAST operand as the condition for the 'if' statement.
     *       Additionally, the calculation for the bottom boundary check (circleY + circleX > rectHeight)
     *       is a direct replication of the original's logic, which might differ from a standard
     *       geometric check (e.g., using 'radius' instead of 'circleX' for bottom boundary).
     */
    function performBoundaryCheck(rectWidth, rectHeight, circleX, circleY, radius) {
        // Evaluate potential boundary violations.
        // These intermediate variables are introduced for clarity and to explicitly show
        // all four conditions that were present (but effectively ignored) in the original
        // 'if' statement's comma-separated list.
        const exceedsLeftEdge = (circleX - radius < 0);
        const exceedsTopEdge = (circleY - radius < 0);
        const exceedsRightEdge = (circleX + radius > rectWidth);
        const exceedsBottomEdgeDueToBug = (circleY + circleX > rectHeight); // Direct replication of original bug: y + x > H

        // The comma operator (',') in JavaScript evaluates each expression from left to right,
        // and its result is the value of the last expression.
        // Therefore, the 'if' statement's condition is effectively determined solely by
        // the truthiness of 'exceedsBottomEdgeDueToBug'. The preceding checks are performed
        // but their boolean results are discarded for the purpose of the 'if' condition.
        if (exceedsLeftEdge, exceedsTopEdge, exceedsRightEdge, exceedsBottomEdgeDueToBug) {
            console.log('OUT_OF_BOUNDS');
        } else {
            console.log('WITHIN_BOUNDS');
        }
    }

}(require('node:fs').readFileSync('/dev/stdin', 'utf8'))); // Utilizing Node.js 'fs' module to read standard input as a UTF-8 string.