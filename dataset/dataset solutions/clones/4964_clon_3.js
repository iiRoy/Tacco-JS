'use strict';
// This module provides a solution to a grid pattern detection problem.
// It reads grid dimensions, a number of observation points, and then
// processes each point to determine if a consistent linear pattern
// exists across rows and columns based on the observed values.

/**
 * Halts program execution and prints a specified message.
 * @param {string} message - The message to print before exiting.
 */
const terminateExecutionWithResult = (message = 'No') => {
    console.log(message);
    process.exit(0); // Exit with code 0 indicating successful completion (even if 'No' is output)
};

/**
 * Parses a string of space-separated numbers into an array of numbers.
 * @param {string} lineData - The input string containing numbers.
 * @returns {number[]} An array of parsed numbers.
 */
const parseNumericSequence = (lineData) => lineData.split(' ').map(Number);

/**
 * Checks if a given value is a whole number (integer).
 * @param {number} value - The number to check.
 * @returns {boolean} True if the value is an integer, false otherwise.
 */
const isValueIntegral = (value) => Number.isInteger(value);

// --- Input Data Acquisition ---
// Read all input from standard input, decode as UTF-8, trim whitespace, and split into lines.
const allInputContent = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

// The first line contains grid dimensions (Rows, Columns).
const [gridRowCount, gridColumnCount] = parseNumericSequence(allInputContent[0]);

// The second line contains the total number of data points to process.
const totalObservedPoints = parseInt(allInputContent[1], 10);

// The remaining lines contain the actual (row, column, value) data for each point.
const observationDataEntries = allInputContent.slice(2);

// --- State Management for Pattern Analysis ---
// This object holds all the dynamic state required to detect the linear patterns.
const patternAnalysisState = {
    // Consistent step differences observed along rows, categorized by column parity.
    // 'null' signifies no difference has been established yet for that category.
    rowOddColumnStep: null,
    rowEvenColumnStep: null,

    // Consistent step differences observed along columns, categorized by row parity.
    colOddRowStep: null,
    colEvenRowStep: null,

    // Registries (Maps) to store previously encountered points.
    // Keys are the fixed coordinate (e.g., row for a row-wise check),
    // values are objects containing the varying coordinate and the point's value.
    // Example: { coord: 5, val: 100 } where 5 is the column index and 100 is its value.
    rowOddCoordRegistry: new Map(),   // For points on odd-indexed rows
    rowEvenCoordRegistry: new Map(),  // For points on even-indexed rows
    colOddCoordRegistry: new Map(),   // For points on odd-indexed columns
    colEvenCoordRegistry: new Map()   // For points on even-indexed columns
};

/**
 * Validates if the extrapolated values at the boundaries of a linear segment
 * remain non-negative, based on a calculated step difference.
 * @param {number} currentObservedValue - The value at the current observed point.
 * @param {number} linearStepDifference - The calculated step value for the pattern.
 * @param {number} currentSegmentCoord - The coordinate of the current point along the segment (e.g., column index).
 * @param {number} totalSegmentLength - The total length/size of the segment (e.g., gridColumnCount).
 * @param {boolean} isTwoUnitDimension - True if the totalSegmentLength is exactly 2.
 * @param {boolean} isSegmentCoordOdd - True if currentSegmentCoord is odd.
 * @param {boolean} isRegistryForEvenCoords - True if the registry being used is for even-indexed coordinates.
 */
const checkExtrapolatedBounds = (
    currentObservedValue,
    linearStepDifference,
    currentSegmentCoord,
    totalSegmentLength,
    isTwoUnitDimension,
    isRegistryForEvenCoords // Simplified from isSegmentCoordOdd for parity context
) => {
    let offsetToStart; // Distance from current point to the effective start of the segment
    let offsetToEnd;   // Distance from current point to the effective end of the segment

    if (isTwoUnitDimension) {
        // If the dimension is only 2 units (e.g., R=2 or C=2), the offsets are direct.
        offsetToStart = currentSegmentCoord;
        offsetToEnd = totalSegmentLength - currentSegmentCoord;
    } else {
        // For larger dimensions, offsets are relative to 'paired' coordinates (e.g., (R/2)-1 for even, R/2 for odd).
        if (isRegistryForEvenCoords) {
            offsetToStart = (currentSegmentCoord / 2) - 1; // For even coords, first even is at 2, so (2/2)-1 = 0 steps.
            offsetToEnd = Math.floor((totalSegmentLength - currentSegmentCoord) / 2);
        } else { // Registry for odd coords
            offsetToStart = Math.floor(currentSegmentCoord / 2); // For odd coords, first odd is at 1, so (1/2)=0 steps.
            offsetToEnd = Math.floor((totalSegmentLength - currentSegmentCoord) / 2);
        }
    }

    // Check if the value would fall below zero at either end of the segment.
    if (currentObservedValue - linearStepDifference * offsetToStart < 0 ||
        currentObservedValue + linearStepDifference * offsetToEnd < 0) {
        terminateExecutionWithResult();
    }
};

/**
 * Core function to process a single point's data along a specific dimension (row or column).
 * It registers points, calculates linear differences, checks for consistency, and validates bounds.
 * @param {number} fixedCoord - The coordinate that remains constant for this segment (e.g., row index for a column segment).
 * @param {number} varyingCoord - The coordinate that changes along the segment (e.g., column index for a column segment).
 * @param {number} pointValue - The value observed at (fixedCoord, varyingCoord).
 * @param {number} totalDimensionSize - The total size of the varying dimension (e.g., gridColumnCount).
 * @param {boolean} isDimensionTwoUnits - True if totalDimensionSize is 2.
 * @param {Map<number, {coord: number, val: number}>} currentRegistryMap - The map relevant to this parity/dimension.
 * @param {{value: number|null}} stepRef - A mutable reference object to the global step difference variable (e.g., {value: patternAnalysisState.rowOddColumnStep}).
 * @param {boolean} registryHandlesEvenCoords - True if currentRegistryMap is for even-indexed coordinates.
 */
const analyzeDimensionSegment = (
    fixedCoord,
    varyingCoord,
    pointValue,
    totalDimensionSize,
    isDimensionTwoUnits,
    currentRegistryMap,
    stepRef, // Allows updating primitive `null` or `number` state variables
    registryHandlesEvenCoords
) => {
    let establishedStep = stepRef.value; // Get the current established step difference

    if (currentRegistryMap.has(fixedCoord)) {
        // A point on this 'fixedCoord' line has been seen before.
        const priorPoint = currentRegistryMap.get(fixedCoord);
        const priorVaryingCoord = priorPoint.coord;
        const priorPointValue = priorPoint.val;

        let potentialStepDelta;
        let coordinateDifferenceFactor;

        if (isDimensionTwoUnits) {
            // For 2-unit dimensions (e.g., R=2), the step is simply the value difference.
            potentialStepDelta = priorPointValue - pointValue;
        } else {
            // For larger dimensions, the step is scaled by the half-difference in coordinates.
            coordinateDifferenceFactor = (priorVaryingCoord - varyingCoord) / 2;

            if (coordinateDifferenceFactor === 0) {
                // If coordinates are identical but values differ, it's an inconsistency.
                // If values are also identical, it's a redundant observation.
                if (priorPointValue !== pointValue) {
                    terminateExecutionWithResult();
                }
                return; // No new information from this point for this segment.
            }
            potentialStepDelta = (priorPointValue - pointValue) / coordinateDifferenceFactor;

            // The step difference must be an integer for non-2 unit dimensions.
            if (!isValueIntegral(potentialStepDelta)) {
                terminateExecutionWithResult();
            }
        }

        // Check for consistency with the globally established step difference.
        if (establishedStep === null) {
            // This is the first pair of points for this category; establish the step.
            stepRef.value = potentialStepDelta;
            establishedStep = potentialStepDelta; // Update local reference

            // Type III Addition: Re-validate ALL previously registered points in this registry
            // against the newly established consistent step difference. This ensures that
            // even points registered before a step was defined are compliant.
            for (const [, regPointData] of currentRegistryMap.entries()) {
                checkExtrapolatedBounds(
                    regPointData.val,
                    establishedStep,
                    regPointData.coord, // The varying coordinate of the registered point
                    totalDimensionSize,
                    isDimensionTwoUnits,
                    registryHandlesEvenCoords
                );
            }
        } else if (potentialStepDelta !== establishedStep) {
            // Inconsistency detected: the calculated step does not match the established one.
            terminateExecutionWithResult();
        }

        // Validate the current point's extrapolated values against the established step.
        checkExtrapolatedBounds(
            pointValue,
            establishedStep,
            varyingCoord,
            totalDimensionSize,
            isDimensionTwoUnits,
            registryHandlesEvenCoords
        );

    } else {
        // This is the first point encountered for this 'fixedCoord' line; register it.
        currentRegistryMap.set(fixedCoord, { coord: varyingCoord, val: pointValue });
    }
};


// --- Main Processing Loop: Iterate through each observed data point ---
for (let obsPointIndex = 0; obsPointIndex < totalObservedPoints; obsPointIndex++) {
    const [currentR, currentC, currentA] = parseNumericSequence(observationDataEntries[obsPointIndex]);

    // --- Process along columns (i.e., varying row, fixed column) ---
    // The 'fixed' coordinate is the column (currentC), and 'varying' is the row (currentR).
    if (gridRowCount === 2) {
        // Special case: If there are only 2 rows, all row coordinates are treated uniformly.
        analyzeDimensionSegment(
            currentC, // Fixed coordinate (column index)
            currentR, // Varying coordinate (row index)
            currentA,
            gridRowCount,
            true, // isDimensionTwoUnits = true
            patternAnalysisState.colEvenCoordRegistry, // Use 'even' registry as a default for R=2
            { value: patternAnalysisState.colEvenRowStep, set: (val) => patternAnalysisState.colEvenRowStep = val },
            true // registryHandlesEvenCoords
        );
    } else {
        // General case: Distinguish processing based on the parity of the varying row coordinate.
        const isCurrentRowOdd = (currentR % 2 !== 0);
        if (!isCurrentRowOdd) { // Even row
            analyzeDimensionSegment(
                currentC,
                currentR,
                currentA,
                gridRowCount,
                false, // isDimensionTwoUnits = false
                patternAnalysisState.colEvenCoordRegistry,
                { value: patternAnalysisState.colEvenRowStep, set: (val) => patternAnalysisState.colEvenRowStep = val },
                true // registryHandlesEvenCoords
            );
        } else { // Odd row
            analyzeDimensionSegment(
                currentC,
                currentR,
                currentA,
                gridRowCount,
                false,
                patternAnalysisState.colOddCoordRegistry,
                { value: patternAnalysisState.colOddRowStep, set: (val) => patternAnalysisState.colOddRowStep = val },
                false // registryHandlesEvenCoords (this handles odd coords)
            );
        }
    }

    // --- Process along rows (i.e., varying column, fixed row) ---
    // The 'fixed' coordinate is the row (currentR), and 'varying' is the column (currentC).
    if (gridColumnCount === 2) {
        // Special case: If there are only 2 columns, all column coordinates are treated uniformly.
        analyzeDimensionSegment(
            currentR, // Fixed coordinate (row index)
            currentC, // Varying coordinate (column index)
            currentA,
            gridColumnCount,
            true, // isDimensionTwoUnits = true
            patternAnalysisState.rowEvenCoordRegistry, // Use 'even' registry as a default for C=2
            { value: patternAnalysisState.rowEvenColumnStep, set: (val) => patternAnalysisState.rowEvenColumnStep = val },
            true // registryHandlesEvenCoords
        );
    } else {
        // General case: Distinguish processing based on the parity of the varying column coordinate.
        const isCurrentColumnOdd = (currentC % 2 !== 0);
        if (!isCurrentColumnOdd) { // Even column
            analyzeDimensionSegment(
                currentR,
                currentC,
                currentA,
                gridColumnCount,
                false, // isDimensionTwoUnits = false
                patternAnalysisState.rowEvenCoordRegistry,
                { value: patternAnalysisState.rowEvenColumnStep, set: (val) => patternAnalysisState.rowEvenColumnStep = val },
                true // registryHandlesEvenCoords
            );
        } else { // Odd column
            analyzeDimensionSegment(
                currentR,
                currentC,
                currentA,
                gridColumnCount,
                false,
                patternAnalysisState.rowOddCoordRegistry,
                { value: patternAnalysisState.rowOddColumnStep, set: (val) => patternAnalysisState.rowOddColumnStep = val },
                false // registryHandlesEvenCoords (this handles odd coords)
            );
        }
    }
}

// If the program reaches this point, all observed points are consistent with the
// established linear patterns and boundary conditions.
terminateExecutionWithResult('Yes');