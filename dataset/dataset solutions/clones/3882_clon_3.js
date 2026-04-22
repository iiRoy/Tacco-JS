'use strict';

/**
 * Parses a raw string of space-separated numbers into an array of numbers.
 * Handles various whitespace patterns.
 * @param {string} rawInputString - The input string containing numbers.
 * @returns {number[]} An array of parsed numerical values.
 */
const parseNumericInputValues = (rawInputString) => {
    // Trim leading/trailing whitespace and replace multiple spaces with a single space
    const processedString = rawInputString.trim().replace(/\s+/g, ' ');
    // Split by space and convert each part to a number
    return processedString.split(' ').map(str => Number(str));
};

/**
 * Calculates the maximum possible profit by collecting sushi on a circular track.
 * The problem involves different travel strategies:
 * 1. Single pass clockwise.
 * 2. Single pass counter-clockwise.
 * 3. Clockwise to a point, return to origin, then counter-clockwise to another point.
 * 4. Counter-clockwise to a point, return to origin, then clockwise to another point.
 *
 * @param {string} dataPayload - The raw input string containing N, C, and then N pairs of (distance, value).
 * @returns {number} The maximum profit achievable.
 */
function ComputeOptimalSushiProfit(dataPayload) {
    // --- Input Processing and Initial Validation ---
    let parsedNumericalData = parseNumericInputValues(dataPayload);

    // Basic integrity check for input data structure
    if (parsedNumericalData.length < 2) {
        // Not enough data for N and C. Assume no profit.
        return 0;
    }

    const numberOfSushiItems = parsedNumericalData.shift(); // N
    const trackCircumference = parsedNumericalData.shift(); // C

    // Further validation for problem constraints
    if (numberOfSushiItems <= 0 || trackCircumference <= 0) {
        // No items or no track means no profit is possible.
        return 0;
    }
    if (parsedNumericalData.length !== numberOfSushiItems * 2) {
        // Mismatch between declared number of items and actual item data provided.
        // This indicates malformed input, so we return 0.
        return 0;
    }

    // --- Phase 1: Pre-calculate values for clockwise travel ---
    // `clockwiseDistances[i]` stores the distance of the i-th sushi from the origin (0) in clockwise direction.
    let clockwiseDistances = new Array(numberOfSushiItems);
    // `cumulativeValuesCw[i]` stores the total value accumulated by collecting sushi from 0 up to i (inclusive) in clockwise direction.
    let cumulativeValuesCw = new Array(numberOfSushiItems);

    // Initialize data for the first sushi item (index 0)
    clockwiseDistances[0] = parsedNumericalData[0];
    cumulativeValuesCw[0] = parsedNumericalData[1];

    // Populate arrays for subsequent sushi items
    for (let i = 1; i < numberOfSushiItems; i++) {
        clockwiseDistances[i] = parsedNumericalData[2 * i];
        cumulativeValuesCw[i] = cumulativeValuesCw[i - 1] + parsedNumericalData[2 * i + 1];
    }

    // --- Phase 2: Pre-calculate values for counter-clockwise travel ---
    // `counterClockwiseDistances[i]` stores the distance of the i-th sushi from the origin (0)
    // if traveling counter-clockwise. This is `C - clockwiseDistances[i]`.
    let counterClockwiseDistances = new Array(numberOfSushiItems);
    // `cumulativeValuesCcw[i]` stores the total value accumulated by collecting sushi
    // if traveling counter-clockwise and stopping at the sushi with original index `i`.
    // This implies collecting sushi from `N-1` down to `i`.
    let cumulativeValuesCcw = new Array(numberOfSushiItems);

    // Get the total value of all sushi for CCW calculations
    const totalValueOfAllSushi = cumulativeValuesCw[numberOfSushiItems - 1];

    for (let i = 0; i < numberOfSushiItems; i++) {
        counterClockwiseDistances[i] = trackCircumference - clockwiseDistances[i];
        // The value collected if stopping at sushi `i` (going CCW) is the total value
        // minus the value collected *before* sushi `i` (going CW).
        cumulativeValuesCcw[i] = totalValueOfAllSushi - (i > 0 ? cumulativeValuesCw[i - 1] : 0);
    }

    // --- Phase 3: Calculate net profit for single-direction journeys ---
    // `netProfitSingleCw[i]` = (value collected up to sushi `i` CW) - (distance to sushi `i` CW)
    let netProfitSingleCw = clockwiseDistances.map((pos, idx) => cumulativeValuesCw[idx] - pos);
    // `netProfitSingleCcw[i]` = (value collected up to sushi `i` CCW) - (distance to sushi `i` CCW)
    let netProfitSingleCcw = counterClockwiseDistances.map((pos, idx) => cumulativeValuesCcw[idx] - pos);

    // --- Phase 4: Calculate prefix/suffix maximums for single-direction net profits ---
    // `maxProfitUpToCw[i]` stores the maximum `netProfitSingleCw` encountered from index 0 up to `i`.
    let maxProfitUpToCw = new Array(numberOfSushiItems);
    maxProfitUpToCw[0] = netProfitSingleCw[0];
    for (let i = 1; i < numberOfSushiItems; i++) {
        maxProfitUpToCw[i] = Math.max(netProfitSingleCw[i], maxProfitUpToCw[i - 1]);
    }

    // `maxProfitFromCcw[i]` stores the maximum `netProfitSingleCcw` encountered from index `i` down to `N-1`.
    let maxProfitFromCcw = new Array(numberOfSushiItems);
    maxProfitFromCcw[numberOfSushiItems - 1] = netProfitSingleCcw[numberOfSushiItems - 1];
    for (let i = numberOfSushiItems - 2; i >= 0; i--) {
        maxProfitFromCcw[i] = Math.max(netProfitSingleCcw[i], maxProfitFromCcw[i + 1]);
    }

    // --- Phase 5: Calculate net profits for double-pass journeys ---
    // This strategy involves going in one direction, returning to the origin, and then going in the opposite direction.

    // `profitCwThenCcw[i]` represents:
    // Go clockwise to sushi `i`, collect its value.
    // Return to the origin (cost: `clockwiseDistances[i]`).
    // Then, go counter-clockwise from origin to maximize profit from *remaining* sushi (those after `i` in CW order).
    let profitCwThenCcw = new Array(numberOfSushiItems);
    for (let i = 0; i < numberOfSushiItems; i++) {
        // Profit from the initial clockwise leg to sushi `i`: cumulativeValuesCw[i] - clockwiseDistances[i]
        // Cost to return to origin from sushi `i`: clockwiseDistances[i]
        // Max profit from the subsequent counter-clockwise leg (considering sushi from `i+1` onwards):
        // This is `maxProfitFromCcw[i+1]` if `i+1` is a valid index, otherwise 0 (no more sushi to collect CCW).
        const ccwLegMaxProfit = (i + 1 < numberOfSushiItems) ? maxProfitFromCcw[i + 1] : 0;
        profitCwThenCcw[i] = (cumulativeValuesCw[i] - (clockwiseDistances[i] * 2)) + ccwLegMaxProfit;
    }

    // `profitCcwThenCw[i]` represents:
    // Go counter-clockwise to sushi `i`, collect its value.
    // Return to the origin (cost: `counterClockwiseDistances[i]`).
    // Then, go clockwise from origin to maximize profit from *remaining* sushi (those before `i` in CW order).
    let profitCcwThenCw = new Array(numberOfSushiItems);
    for (let i = 0; i < numberOfSushiItems; i++) {
        // Profit from the initial counter-clockwise leg to sushi `i`: cumulativeValuesCcw[i] - counterClockwiseDistances[i]
        // Cost to return to origin from sushi `i`: counterClockwiseDistances[i]
        // Max profit from the subsequent clockwise leg (considering sushi up to `i-1`):
        // This is `maxProfitUpToCw[i-1]` if `i-1` is a valid index, otherwise 0 (no more sushi to collect CW).
        const cwLegMaxProfit = (i - 1 >= 0) ? maxProfitUpToCw[i - 1] : 0;
        profitCcwThenCw[i] = (cumulativeValuesCcw[i] - (counterClockwiseDistances[i] * 2)) + cwLegMaxProfit;
    }

    // --- Phase 6: Determine the overall maximum profit ---
    // Initialize with 0, representing the option to not move at all.
    let allPotentialProfits = [0];

    if (numberOfSushiItems > 0) {
        // Add maximums from all calculated strategies
        allPotentialProfits.push(Math.max(...maxProfitUpToCw));
        allPotentialProfits.push(Math.max(...maxProfitFromCcw));
        allPotentialProfits.push(Math.max(...profitCwThenCcw));
        allPotentialProfits.push(Math.max(...profitCcwThenCw));
    }
    
    // The highest value among all possibilities is the answer.
    return Math.max(...allPotentialProfits);
}

// Standard competitive programming input handling
const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
console.log(ComputeOptimalSushiProfit(rawInputData));