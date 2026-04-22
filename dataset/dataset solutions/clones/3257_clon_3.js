'use strict'

/**
 * Processes raw input data representing a series of plant heights
 * to calculate the cumulative positive height differences.
 * This effectively measures the "growth" across a garden, where any
 * decrease in height resets the baseline for subsequent growth calculations.
 *
 * @param {string} rawInputData - A multi-line string where the first line (optional)
 *                                might contain a count, and the second line contains
 *                                space-separated integer plant heights.
 */
function ProcessGardenData(rawInputData) {
    // Sanitize and segment the input string.
    const inputSegments = rawInputData.trim().split('\n');

    // Implement early exit conditions for malformed or insufficient input.
    if (!inputSegments || inputSegments.length < 2) {
        console.log(0); // If structure is invalid, no growth is possible.
        return;
    }

    // Extract the line containing the height data.
    const heightValuesString = inputSegments[1];

    // Parse individual height values, converting them to integers.
    // Use `parseInt` with radix for robustness and filter out any non-numeric results.
    const gardenPlantElevations = heightValuesString
        .split(' ')
        .map(segment => parseInt(segment.trim(), 10))
        .filter(value => Number.isFinite(value)); // Ensure only valid numbers are processed.

    // If no valid plant heights are found after parsing, the cumulative growth is zero.
    if (gardenPlantElevations.length === 0) {
        console.log(0);
        return;
    }

    // Initialize tracking variables for the traversal.
    // `currentBaselineHeight` represents the effective height from which subsequent growth is measured.
    // `totalCumulativeRise` accumulates all positive height differences.
    let currentBaselineHeight = 0;
    let totalCumulativeRise = 0;

    // Iterate through the array of plant elevations to compute the total rise.
    // The loop structure is chosen for explicit index control, demonstrating an alternative to `forEach`.
    for (let plantIndex = 0; plantIndex < gardenPlantElevations.length; plantIndex++) {
        const observedPlantHeight = gardenPlantElevations[plantIndex];

        // Declare a temporary variable to hold the rise for the current step.
        let instantaneousRise = 0;

        // Conditional logic to determine if growth occurred or if the baseline needs resetting.
        if (observedPlantHeight < currentBaselineHeight) {
            // If the current plant is shorter than the established baseline,
            // reset the baseline to the current plant's height. No growth is added for this step.
            currentBaselineHeight = observedPlantHeight;
            // instantaneousRise remains 0 in this branch.
        } else {
            // If the current plant is taller than or equal to the baseline,
            // calculate the positive difference and add it to the total cumulative rise.
            instantaneousRise = observedPlantHeight - currentBaselineHeight;
            // Update the baseline to the current plant's height for the next comparison.
            currentBaselineHeight = observedPlantHeight;
        }

        // Add the calculated (possibly zero) instantaneous rise to the overall total.
        totalCumulativeRise += instantaneousRise;
    }

    // Output the final calculated total cumulative rise.
    console.log(totalCumulativeRise);
}

// Standard entry point for competitive programming environments:
// Reads input from standard input and passes it to the main processing function.
ProcessGardenData(require('fs').readFileSync('/dev/stdin', 'utf8'));