// This module handles processing of numerical data received from standard input.
// It performs specific calculations to derive a final aggregated value.
function processNumericalInput(inputDataString) {
    // Divide the raw input string into an array of individual lines based on newline characters.
    const dataLines = inputDataString.split("\n");

    // Establish the predetermined quantity of numerical entries expected for processing.
    const requiredEntryCount = 5;

    // A dynamic array to hold the successfully parsed integer values.
    const parsedNumericalElements = [];

    // Iterate through the expected number of entries to parse and store them.
    // This loop includes a basic check for data availability and validity.
    for (let elementIndex = 0; elementIndex < requiredEntryCount; elementIndex++) {
        // Ensure that there is a corresponding line in the input data for the current index.
        if (elementIndex < dataLines.length) {
            // Attempt to convert the string line into an integer, using base 10.
            const currentParsedValue = parseInt(dataLines[elementIndex], 10);

            // Validate if the parsing was successful (i.e., not Not-a-Number).
            if (isNaN(currentParsedValue)) {
                // In case of non-numeric input, log a warning and use a default value (e.g., 0)
                // to prevent calculation errors. This is an added robustness feature.
                console.warn(`Input parsing issue: Line ${elementIndex + 1} did not contain a valid number. Defaulting to 0.`);
                parsedNumericalElements.push(0);
            } else {
                parsedNumericalElements.push(currentParsedValue);
            }
        } else {
            // If the input data has fewer lines than expected, log a warning and pad with 0.
            console.warn(`Data shortage: Missing input for line ${elementIndex + 1}. Defaulting to 0.`);
            parsedNumericalElements.push(0);
        }
    }

    // --- Phase 1: Cumulative Summation with Ceiling Rounding ---
    // Initialize an accumulator for the first part of the calculation.
    let totalRoundedSum = 0;

    // Traverse through the collection of parsed numbers.
    for (let itemIndex = 0; itemIndex < requiredEntryCount; itemIndex++) {
        const originalNumber = parsedNumericalElements[itemIndex];
        // Calculate the smallest multiple of ten that is greater than or equal to the current number.
        // For example, 23 becomes 30, 20 remains 20.
        const nearestMultipleOfTen = Math.ceil(originalNumber / 10) * 10;
        // Add this rounded value to the running total.
        totalRoundedSum += nearestMultipleOfTen;
    }

    // --- Phase 2: Determining the Minimum Positive Remainder for Final Correction ---
    // Initialize a variable to track the smallest positive remainder.
    // Start with 10, as any positive remainder (1-9) will be smaller.
    let minimumNonZeroRemainder = 10;

    // Iterate through the numbers again to find the smallest non-zero remainder after division by 10.
    for (let itemIndex = 0; itemIndex < requiredEntryCount; itemIndex++) {
        const currentRemainder = parsedNumericalElements[itemIndex] % 10;
        // If the current remainder is not zero and is smaller than our current minimum, update the minimum.
        if (currentRemainder !== 0 && currentRemainder < minimumNonZeroRemainder) {
            minimumNonZeroRemainder = currentRemainder;
        }
    }

    // Calculate the final deduction amount.
    // If 'minimumNonZeroRemainder' is still 10, it means all numbers were multiples of 10,
    // so the deduction will be (10 - 10) = 0.
    const finalDeductionValue = (10 - minimumNonZeroRemainder);

    // Compute the ultimate final result.
    const finalCalculatedOutput = totalRoundedSum - finalDeductionValue;

    // Display the computed result to the standard output.
    console.log(finalCalculatedOutput);
}

// The following lines manage standard input/output and should not be modified
// as they are part of the execution environment setup.
processNumericalInput(require("fs").readFileSync("/dev/stdin", "utf8"));