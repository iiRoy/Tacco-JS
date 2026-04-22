"use strict";

/**
 * Expert Module for Segment Interval Analysis
 *
 * This utility processes a string input to calculate a specific 'distance'
 * between two numerical segments on a number line. Each segment is defined
 * by a starting point and a common fixed width.
 *
 * The calculation logic adheres strictly to the original problem's definition,
 * which may exhibit specific behaviors under certain overlap conditions.
 *
 * Input format: A single line containing three space-separated integers:
 *               [common_width] [segment_A_start_position] [segment_B_start_position]
 *
 * Example: "5 0 6" would define segments [0, 5] and [6, 11] with width 5.
 */

// Helper function to display the final calculated result.
const renderFinalResult = (valueToDisplay) => {
    // Outputs the computed numerical value to the standard console.
    console.log(valueToDisplay);
};

// The primary function orchestrating the calculation.
const processNumericalIntervals = (rawInputText) => {
    // Step 1: Parse the input string.
    // Extract the first meaningful line from the overall raw input.
    const inputLines = rawInputText.split('\n');
    const primaryInputLine = inputLines[0];

    // Split the primary line into its constituent string components.
    const stringComponents = primaryInputLine.split(' ');

    // Convert string components to numerical values.
    // Assign descriptive variable names for clarity and Type II changes.
    const segmentSpanDimension = Number(stringComponents[0]); // Corresponds to original 'W'
    const firstSegmentInitialPoint = Number(stringComponents[1]); // Corresponds to original 'a'
    const secondSegmentInitialPoint = Number(stringComponents[2]); // Corresponds to original 'b'

    // Optional Type III addition: Basic input validation check.
    // This could be expanded for more robust error handling, but for this clone,
    // we'll proceed, allowing NaN propagation if input is malformed, similar to original parseInt.
    // If (isNaN(segmentSpanDimension) || isNaN(firstSegmentInitialPoint) || isNaN(secondSegmentInitialPoint)) {
    //     renderFinalResult("Invalid Numeric Input");
    //     return;
    // }

    // Step 2: Calculate segment end points.
    // Introduce intermediate variables for segment boundaries.
    const firstSegmentFinalPoint = firstSegmentInitialPoint + segmentSpanDimension;
    const secondSegmentFinalPoint = secondSegmentInitialPoint + segmentSpanDimension;

    // Step 3: Evaluate the primary conditional logic.
    // The original logic checks if one segment's end extends beyond the other's start,
    // OR vice versa. This effectively determines if they are not completely separated
    // where one is entirely to the left of the other.
    const isFirstSegmentEndPastSecondStart = firstSegmentFinalPoint > secondSegmentInitialPoint;
    const isSecondSegmentEndPastFirstStart = secondSegmentFinalPoint > firstSegmentInitialPoint;

    // Combine the conditions using a logical OR operator.
    const potentialOverlapOrTouchCondition = isFirstSegmentEndPastSecondStart || isSecondSegmentEndPastFirstStart;

    let finalCalculatedDistance; // Declare a mutable variable for the result.

    // Step 4: Apply the conditional branching.
    // This is a Type III rewrite of the original `if` statement and ternary operator.
    if (potentialOverlapOrTouchCondition) {
        // If the segments overlap or touch according to the specific condition, the distance is 0.
        finalCalculatedDistance = 0;
    } else {
        // If they do not overlap/touch, calculate the actual gap between them.
        // Determine which segment is positioned to the left to correctly calculate the positive gap.
        const isFirstSegmentLeftward = firstSegmentInitialPoint < secondSegmentInitialPoint;

        if (isFirstSegmentLeftward) {
            // Segment 1 is to the left of Segment 2.
            // Distance is the start of Segment 2 minus the end of Segment 1.
            finalCalculatedDistance = secondSegmentInitialPoint - firstSegmentFinalPoint;
        } else {
            // Segment 2 is to the left of Segment 1 (or they start at the same point).
            // Distance is the start of Segment 1 minus the end of Segment 2.
            finalCalculatedDistance = firstSegmentInitialPoint - secondSegmentFinalPoint;
        }
    }

    // Step 5: Output the final result using the dedicated helper.
    renderFinalResult(finalCalculatedDistance);
};

// Initial execution point.
// Reads input from standard input and passes it to the main processing function.
// This part remains structurally similar to ensure input source compatibility.
processNumericalIntervals(require('fs').readFileSync('/dev/stdin', 'utf8'));