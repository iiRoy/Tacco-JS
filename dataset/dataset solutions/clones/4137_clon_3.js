// This function serves as the primary entry point for processing input data
// and calculating the number of doubling operations required.
function computeDoublingSteps(rawData) {
    // --- Configuration Constants ---
    const INPUT_LINE_SEPARATOR = "\n";
    const BOUNDS_VALUE_SEPARATOR = " ";
    // Threshold for direct number calculations. Numbers with this many digits or fewer
    // are typically safe for standard JavaScript Number type operations (up to 2^53 - 1).
    const MAX_SAFE_INTEGER_DIGIT_COUNT = 15;
    // The number of digits used for the lower segment when representing large numbers.
    const LARGE_NUMBER_SEGMENT_SIZE = 10;

    // --- Helper Function: checkWithinBounds ---
    // Compares two large numbers, each represented as an array [highPart, lowPart].
    // Returns true if the current value is less than or equal to the target value.
    const checkWithinBounds = (currentValParts, targetValParts) => {
        // Compare the higher-order parts first.
        if (currentValParts[0] < targetValParts[0]) {
            return true;
        }
        // If higher-order parts are identical, compare the lower-order parts.
        if (currentValParts[0] === targetValParts[0]) {
            return currentValParts[1] <= targetValParts[1];
        }
        // If current high part is greater than target high part, it's out of bounds.
        return false;
    };

    // --- Helper Function: segmentNumericString ---
    // Splits a string representation of a large number into two numeric parts:
    // [high_order_part_as_number, low_order_part_as_number].
    // The low-order part always contains `LARGE_NUMBER_SEGMENT_SIZE` digits,
    // potentially padded with leading zeros if the original number is short.
    const segmentNumericString = (fullNumericStr) => {
        // Determine the effective length for padding to ensure the low part is correctly extracted.
        const effectiveLength = Math.max(fullNumericStr.length, LARGE_NUMBER_SEGMENT_SIZE);
        const paddedString = fullNumericStr.padStart(effectiveLength, '0');

        // Extract the last 'LARGE_NUMBER_SEGMENT_SIZE' digits for the low part.
        const lowPartStr = paddedString.slice(-LARGE_NUMBER_SEGMENT_SIZE);
        // Extract the remaining digits for the high part.
        const highPartStr = paddedString.slice(0, -LARGE_NUMBER_SEGMENT_SIZE);

        return [Number(highPartStr), Number(lowPartStr)];
    };


    // --- Input Parsing and Validation ---
    const allInputLines = rawData.split(INPUT_LINE_SEPARATOR);
    if (allInputLines.length === 0 || allInputLines[0].trim() === "") {
        console.error("Processing Error: Input data is empty or malformed.");
        return;
    }

    const boundaryValueStrings = allInputLines[0].split(BOUNDS_VALUE_SEPARATOR);
    if (boundaryValueStrings.length < 2) {
        console.error("Processing Error: Expected two numeric bounds, but received fewer.");
        return;
    }

    let initialLowerBoundaryString = boundaryValueStrings[0].trim();
    let initialUpperBoundaryString = boundaryValueStrings[1].trim();

    // Initialize a counter for the doubling operations performed.
    let doublingOperationCounter = 0;

    // --- Logic Branching: Small vs. Large Numbers ---
    // Check if the numbers are small enough to be handled directly by standard JavaScript `Number` type
    // without risking precision loss for integer operations.
    const isInSmallNumberRange = initialLowerBoundaryString.length <= MAX_SAFE_INTEGER_DIGIT_COUNT &&
                                 initialUpperBoundaryString.length <= MAX_SAFE_INTEGER_DIGIT_COUNT;

    if (isInSmallNumberRange) {
        // --- Handle Small Numbers ---
        let currentNumericValue = Number(initialLowerBoundaryString);
        const targetNumericValue = Number(initialUpperBoundaryString);

        // Basic validation for parsed numbers.
        if (isNaN(currentNumericValue) || isNaN(targetNumericValue)) {
            console.error("Validation Error: Invalid numeric input detected in small number processing path.");
            return;
        }

        // Guard clause: If the lower bound already exceeds the upper bound, no doublings needed.
        if (currentNumericValue > targetNumericValue) {
            console.log(0);
            return;
        }

        // Perform doubling operations using a do-while loop.
        do {
            currentNumericValue *= 2;        // Double the current value.
            doublingOperationCounter++;      // Increment the counter.
        } while (currentNumericValue <= targetNumericValue); // Continue as long as current value is within bounds.

    } else {
        // --- Handle Large Numbers ---
        // For numbers exceeding JavaScript's safe integer limit, represent them as
        // an array of two numbers: [high_order_part, low_order_part].
        
        let currentLargeNumberParts = segmentNumericString(initialLowerBoundaryString);
        const targetLargeNumberParts = segmentNumericString(initialUpperBoundaryString);

        // Validation for the segmented parts.
        if (isNaN(currentLargeNumberParts[0]) || isNaN(currentLargeNumberParts[1]) ||
            isNaN(targetLargeNumberParts[0]) || isNaN(targetLargeNumberParts[1])) {
            console.error("Validation Error: Invalid numeric input detected after large number segmentation.");
            return;
        }

        // Guard clause: If the initial lower bound already exceeds the upper bound.
        if (!checkWithinBounds(currentLargeNumberParts, targetLargeNumberParts)) {
            console.log(0);
            return;
        }

        // Iteratively double the large number representation.
        while (checkWithinBounds(currentLargeNumberParts, targetLargeNumberParts)) {
            // Double the low-order part.
            let nextLowPart = currentLargeNumberParts[1] * 2;
            let carryToHighPart = 0;

            // Check if doubling the low part resulted in a carry-over to the high part.
            // A carry occurs if 'nextLowPart' is equal to or exceeds 10^LARGE_NUMBER_SEGMENT_SIZE.
            const segmentMaxValue = Math.pow(10, LARGE_NUMBER_SEGMENT_SIZE);
            if (nextLowPart >= segmentMaxValue) {
                carryToHighPart = Math.floor(nextLowPart / segmentMaxValue); // The carry value (usually 1).
                nextLowPart %= segmentMaxValue;                              // The new low part (remainder).
            }

            // Update the current large number parts for the next iteration.
            currentLargeNumberParts = [
                currentLargeNumberParts[0] * 2 + carryToHighPart, // Double high part and add carry.
                nextLowPart                                       // Set the new low part.
            ];
            
            doublingOperationCounter++; // Increment the counter for this operation.
        }
    }

    // Output the final count of doubling operations.
    console.log(doublingOperationCounter);
}

// --- Standard Input/Output Handling ---
// This section should typically not be modified. It reads from standard input
// and passes the content to the main processing function.
computeDoublingSteps(require("fs").readFileSync("/dev/stdin", "utf8"));