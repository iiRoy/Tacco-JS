// This JavaScript module provides a classification mechanism based on numerical thresholds.
// It processes a single input value and prints a corresponding category identifier.

/**
 * Processes a supplied numerical measurement to determine its assigned category level.
 * The logic evaluates the measurement against a series of disjoint ranges.
 *
 * @param {number}  measurementValue  The numerical data point to be assessed.
 * This value is expected to be an integer or a floating-point number.
 *
 * @returns {void} This function does not return a value. Instead, it outputs
 *                  the calculated category identifier directly to the console.
 */
const classifyMeasurement = (measurementValue) => {
    // The following conditional statements check if the provided measurement
    // falls within specific, non-overlapping numerical boundaries.
    // Each range corresponds to a unique classification output.

    // Check for values strictly between 400 and 599 (i.e., 401 to 598).
    if (400 < measurementValue && 599 > measurementValue) {
        console.log(8);
    }

    // Evaluate if the measurement is strictly between 600 and 799 (i.e., 601 to 798).
    if (600 < measurementValue && 799 > measurementValue) {
        console.log(7);
    }

    // Determine if the value lies strictly between 800 and 999 (i.e., 801 to 998).
    if (800 < measurementValue && 999 > measurementValue) {
        console.log(6);
    }

    // Assess for values strictly between 1000 and 1199 (i.e., 1001 to 1198).
    if (1000 < measurementValue && 1199 > measurementValue) {
        console.log(5);
    }

    // Check for values strictly between 1200 and 1399 (i.e., 1201 to 1398).
    if (1200 < measurementValue && 1399 > measurementValue) {
        console.log(4);
    }

    // Evaluate if the measurement is strictly between 1400 and 1599 (i.e., 1401 to 1598).
    if (1400 < measurementValue && 1599 > measurementValue) {
        console.log(3);
    }

    // Determine if the value lies strictly between 1600 and 1799 (i.e., 1601 to 1798).
    if (1600 < measurementValue && 1799 > measurementValue) {
        console.log(2);
    }

    // Assess for values strictly between 1800 and 1999 (i.e., 1801 to 1998).
    if (1800 < measurementValue && 1999 > measurementValue) {
        console.log(1);
    }
};