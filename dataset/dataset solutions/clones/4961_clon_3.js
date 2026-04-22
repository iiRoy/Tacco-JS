'use strict';

// Expert comment: This module processes grid measurement data to determine if it forms a consistent linear progression.
// It handles separate progressions for horizontal/vertical axes and odd/even coordinates.
// The goal is to check for linear consistency across specified grid points.

// --- Type III: Helper Function for Exiting with a specific status ---
// Encapsulates the common pattern of logging a message and terminating execution.
const terminateProgramWithStatus = (exitMessage = 'No') => {
    console.log(exitMessage);
    // In typical competitive programming scenarios, a non-zero exit code indicates an error
    // from the program's perspective, but 'No' is a valid functional output.
    // We'll stick to the original behavior of just calling process.exit() without an explicit code.
    process.exit();
};

// --- Type III: Global storage for progression rates and point records ---
// Renamed from dist_x_odd, map_x_even etc. to more descriptive terms.
// Using `null` as an initial value instead of `-1` for a clearer distinction
// between 'not yet determined' and a potentially valid zero or negative rate.
const globalProgressionRates = {
    horizOddRate: null,
    horizEvenRate: null,
    vertOddRate: null,
    vertEvenRate: null,
};

// Maps to store recorded points, categorized by axis and coordinate parity.
// Map values are now objects `{ coord: value, amount: value }` for better readability
// compared to simple arrays `[value, value]`.
const horizOddPointRecords = new Map(); // Stores { row: [col, amount] } for points with odd column coordinates
const horizEvenPointRecords = new Map(); // Stores { row: [col, amount] } for points with even column coordinates
const vertOddPointRecords = new Map(); // Stores { col: [row, amount] } for points with odd row coordinates
const vertEvenPointRecords = new Map(); // Stores { col: [row, amount] } for points with even row coordinates

// --- Type III: Core Validation Logic Helper ---
// This function encapsulates the complex conditional logic for checking if an 'amount' value
// is valid given a calculated progression rate and its grid coordinates.
// It meticulously replicates the original code's varying offset calculations.
function isAmountValidForProgression(
    evaluatedAmount,          // The 'a' value (a1 or a3) being checked.
    currentProgressionRate,   // The 'd' value (slope/stride) for the current progression.
    currentCoordValue,        // The 'r' or 'c' coordinate (r1/r3 or c1/c3) of the point.
    totalGridDimension,       // The total dimension (R or C) of the grid.
    isProcessingRowAxis,      // True if checking Y-axis (rows), false for X-axis (columns).
    isTotalDimensionTwo,      // True if the 'totalGridDimension' (R or C) is exactly 2.
    isCoordEvenParity,        // True if 'currentCoordValue' is even (used for R/C > 2 cases).
    isCheckingExistingPoint   // True if validating an 'a3' from map iteration, false for 'a1' (current input).
) {
    let firstBoundaryOffset, secondBoundaryOffset;

    if (isTotalDimensionTwo) {
        // Special calculation rules apply when a dimension (R or C) is exactly 2.
        if (isProcessingRowAxis) { // Processing Y-axis (rows), R === 2
            // Original code for R=2 uses (r-1) for both existing and current points.
            firstBoundaryOffset = currentCoordValue - 1;
        } else { // Processing X-axis (columns), C === 2
            // Original code for C=2 is different: (c3-1) for existing, (c1) for current point.
            firstBoundaryOffset = isCheckingExistingPoint ? (currentCoordValue - 1) : currentCoordValue;
        }
        // The second offset is always `totalDimension - currentCoord`.
        secondBoundaryOffset = totalGridDimension - currentCoordValue;
    } else {
        // General calculation rules for dimensions R > 2 or C > 2.
        if (isCoordEvenParity) {
            // For even coordinates (r or c).
            firstBoundaryOffset = (currentCoordValue / 2) - 1;
        } else { // For odd coordinates (r or c).
            firstBoundaryOffset = Math.floor(currentCoordValue / 2);
        }
        // The second offset for general case involves flooring.
        secondBoundaryOffset = Math.floor((totalGridDimension - currentCoordValue) / 2);
    }

    // Expert comment: The core validation check. If either condition is met, the amount is inconsistent.
    // The problem implies linear progression, where amounts must be non-negative at boundaries.
    if ((evaluatedAmount - currentProgressionRate * firstBoundaryOffset < 0) ||
        (evaluatedAmount + currentProgressionRate * secondBoundaryOffset < 0)) {
        return false; // The amount is not valid according to the progression.
    }
    return true; // The amount is valid.
}

// --- Type III: Encapsulates the processing logic for one axis (Y or X) ---
// This function significantly reduces code duplication by abstracting the common logic
// for checking either row-based (Y-axis) or column-based (X-axis) progressions.
function handleDimensionCheck(
    primaryCoord,         // The coordinate relevant to the progression (r1 for Y, c1 for X).
    secondaryCoord,       // The coordinate used as a key in the map (c1 for Y, r1 for X).
    currentAmount,        // The 'a' value of the current measurement (a1).
    totalDimensionSize,   // The total size of the grid along this dimension (numRows for Y, numCols for X).
    isRowAxisCheck        // True if processing rows (Y-axis), false for columns (X-axis).
) {
    // Determine which specific map and progression rate to use based on axis and parity.
    let targetMap, progressionKey;
    const primaryCoordIsEven = (primaryCoord % 2 === 0);

    if (isRowAxisCheck) { // Processing Y-axis (rows)
        targetMap = primaryCoordIsEven ? vertEvenPointRecords : vertOddPointRecords;
        progressionKey = primaryCoordIsEven ? 'vertEvenRate' : 'vertOddRate';
    } else { // Processing X-axis (columns)
        targetMap = primaryCoordIsEven ? horizEvenPointRecords : horizOddPointRecords;
        progressionKey = primaryCoordIsEven ? 'horizEvenRate' : 'horizOddRate';
    }

    const isCurrentDimensionTwo = (totalDimensionSize === 2);
    let currentProgression = globalProgressionRates[progressionKey];

    // Check if a point with the 'secondaryCoord' key already exists in the chosen map.
    if (targetMap.has(secondaryCoord)) {
        const storedPoint = targetMap.get(secondaryCoord);
        const storedPrimaryCoord = isRowAxisCheck ? storedPoint.row : storedPoint.col;
        const storedAmount = storedPoint.amount;

        // Calculate the difference in primary coordinates (e.g., r2 - r1) for stride calculation.
        const coordSpan = storedPrimaryCoord - primaryCoord;

        // Type III: Add a guard for zero coordinate span.
        // If two points are at the same coordinate but have different amounts, it's a contradiction.
        if (coordSpan === 0) {
            if (storedAmount !== currentAmount) {
                terminateProgramWithStatus(); // Inconsistent data.
            }
            // If coordSpan is 0 and amounts are the same, this is a redundant point.
            // The original code would proceed, resulting in NaN for 'calculatedStride',
            // which would then cause `isAmountValidForProgression` to return false.
            // We'll let it proceed to match original behavior, relying on subsequent checks.
        }

        let calculatedStride;
        if (isCurrentDimensionTwo) {
            // Simple stride calculation for dimensions of size 2.
            calculatedStride = (storedAmount - currentAmount) / coordSpan;
        } else {
            // For larger dimensions, the coordinate span is effectively halved for stride calculation.
            calculatedStride = (storedAmount - currentAmount) / (coordSpan / 2);
            // Type III: For these cases, the progression rate must be an integer.
            if (!Number.isInteger(calculatedStride)) {
                terminateProgramWithStatus(); // Non-integer stride means inconsistency.
            }
        }

        if (currentProgression === null) {
            // This is the first time a progression rate is determined for this specific category.
            globalProgressionRates[progressionKey] = calculatedStride;
            currentProgression = calculatedStride; // Update local reference for immediate use.

            // Type III: Crucially, validate ALL previously recorded points in this map
            // against the newly established progression rate.
            for (const [sCoord, sPoint] of targetMap.entries()) {
                const existingPrimaryCoord = isRowAxisCheck ? sPoint.row : sPoint.col;
                const existingAmount = sPoint.amount;
                // The parity parameter for existing points is consistent with the map type.
                if (!isAmountValidForProgression(
                    existingAmount,
                    currentProgression,
                    existingPrimaryCoord,
                    totalDimensionSize,
                    isRowAxisCheck,
                    isCurrentDimensionTwo,
                    primaryCoordIsEven, // Parity is consistent for all points in this map (e.g., all even rows)
                    true // This signifies that we are checking an already existing point.
                )) {
                    terminateProgramWithStatus(); // Inconsistency found during retroactive check.
                }
            }
        } else {
            // A progression rate was already established; ensure the newly calculated stride matches.
            if (calculatedStride !== currentProgression) {
                terminateProgramWithStatus(); // Inconsistent progression rate.
            }
        }

        // Type III: Finally, validate the CURRENT input point with the established (or newly set) progression rate.
        if (!isAmountValidForProgression(
            currentAmount,
            currentProgression,
            primaryCoord,
            totalDimensionSize,
            isRowAxisCheck,
            isCurrentDimensionTwo,
            primaryCoordIsEven, // Parity is consistent with the map type.
            false // This signifies that we are checking the current input point.
        )) {
            terminateProgramWithStatus(); // Current point is inconsistent.
        }

    } else {
        // If no related point found, add the current measurement to the appropriate map.
        // Storing as an object for clarity.
        targetMap.set(secondaryCoord, isRowAxisCheck ? { row: primaryCoord, amount: currentAmount } : { col: primaryCoord, amount: currentAmount });
    }
}

// --- Type III: Input Processing ---
let rawDataLines;
try {
    // Expert comment: Adding robust error handling for file system operations.
    rawDataLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
} catch (error) {
    console.error("Error encountered while reading input data:", error.message);
    terminateProgramWithStatus(); // Exit if input cannot be read.
}

// Extract and parse initial grid dimensions (R, C) and total number of measurements (N).
const gridDimensionsArray = rawDataLines[0].split(' ').map(Number);
const numRows = gridDimensionsArray[0];
const numCols = gridDimensionsArray[1];
const totalMeasurements = Number(rawDataLines[1]); // Using Number() for parsing, similar to parseInt.

// Type III: Add a guard clause for the trivial case of no measurements.
if (totalMeasurements === 0) {
    terminateProgramWithStatus('Yes'); // If no measurements are provided, the grid is vacuously consistent.
}

// Slice the array to get only the actual measurement data lines.
const measurementRecords = rawDataLines.slice(2);

// Expert comment: Main loop to process each individual measurement record.
// Each record provides a (row, column, amount) triplet.
for (let measurementIdx = 0; measurementIdx < totalMeasurements; measurementIdx++) {
    const currentMeasurementString = measurementRecords[measurementIdx];
    const [rowStr, colStr, amountStr] = currentMeasurementString.split(' ');
    
    // Parse measurement values into numerical types.
    const currentR = Number(rowStr);
    const currentC = Number(colStr);
    const currentA = Number(amountStr);

    // Type III: Delegate the Y-axis (row-based) consistency check to a common handler function.
    // Here, 'currentR' is the primary coordinate, 'currentC' is the secondary key.
    handleDimensionCheck(currentR, currentC, currentA, numRows, true);

    // Type III: Delegate the X-axis (column-based) consistency check to the same handler function.
    // Here, 'currentC' is the primary coordinate, 'currentR' is the secondary key.
    handleDimensionCheck(currentC, currentR, currentA, numCols, false);
}

// If the program reaches this point, all measurements have been processed and found consistent.
terminateProgramWithStatus('Yes');