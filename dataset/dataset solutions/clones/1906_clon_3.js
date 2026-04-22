function processStructuralMeasurements(rawInputString) {
    // This function analyzes a sequence of structural measurements to find specific geometric patterns.
    // It identifies pairs of measurement points where the absolute difference in their indices
    // is equal to the sum of their corresponding elevation values.

    // 1. Input Parsing and Initial Data Extraction
    // Split the entire input string into individual data rows based on newline characters.
    const inputDataRows = rawInputString.split("\n");

    // Extract the total number of measurement points from the first line.
    // Use parseInt for robust type conversion, specifying radix 10 for safety.
    const totalMeasurementPoints = parseInt(inputDataRows.shift(), 10);

    // --- Type III Addition: Input Validation ---
    // Ensure the number of points is a valid positive integer.
    if (isNaN(totalMeasurementPoints) || totalMeasurementPoints <= 0) {
        console.error("Error: Invalid or non-positive number of measurement points provided. Aborting analysis.");
        return; // Early exit due to invalid input
    }

    // Extract the elevation values from the second line of the input.
    // Split the string by space and then map each substring to an integer.
    const rawElevationStrings = inputDataRows.shift().split(' ');
    const parsedElevationValues = rawElevationStrings.map(val => parseInt(val, 10));

    // --- Type III Addition: Further Input Validation and Data Refinement ---
    // Check if the actual number of elevations parsed matches the declared count.
    if (parsedElevationValues.length !== totalMeasurementPoints) {
        console.error(`Error: Declared measurement points (${totalMeasurementPoints}) do not match the actual count of provided elevation values (${parsedElevationValues.length}). Aborting analysis.`);
        return; // Early exit
    }

    // Filter out any NaN values that might result from malformed number strings in the elevation data.
    // This ensures we only work with valid numeric elevations.
    const validElevations = parsedElevationValues.filter(val => !isNaN(val));

    if (validElevations.length !== totalMeasurementPoints) {
        console.error("Error: Some elevation values could not be parsed as valid numbers. Aborting analysis.");
        return; // Early exit
    }

    // Assign the validated and parsed elevations for further processing.
    const processedElevations = validElevations;

    // 2. Core Logic: Finding Matching Combinations
    // Initialize a counter for combinations that satisfy the geometric condition.
    // This counter will hold the number of distinct valid pairs.
    let distinctValidCombinations = 0;

    // --- Type III Refactoring: Optimized Loop Structure ---
    // Iterate through all possible unique pairs of measurement points (outerIdx, innerIdx).
    // The loop is structured such that 'outerIdx' always precedes 'innerIdx' (outerIdx < innerIdx).
    // This approach inherently avoids self-comparison (i !== j) and double-counting (e.g., (A,B) and (B,A)),
    // thus eliminating the need for an explicit check (if i !== j) and the final division by 0.5.
    for (let outerIdx = 0; outerIdx < totalMeasurementPoints; outerIdx++) {
        // The inner loop starts from 'outerIdx + 1' to ensure that:
        // 1. We consider only distinct pairs of indices.
        // 2. 'innerIdx' is always greater than 'outerIdx'.
        for (let innerIdx = outerIdx + 1; innerIdx < totalMeasurementPoints; innerIdx++) {
            // Calculate the numerical span between the two measurement points' indices.
            // Since innerIdx > outerIdx, Math.abs is not strictly necessary here, simplifying from original.
            const indexSpan = innerIdx - outerIdx;

            // Retrieve the elevation values for the current pair of indices and calculate their sum.
            const elevationA = processedElevations[outerIdx];
            const elevationB = processedElevations[innerIdx];
            const combinedHeight = elevationA + elevationB;

            // Check if the calculated index span is equal to the combined elevation.
            // This is the core geometric condition for a valid pair.
            if (indexSpan === combinedHeight) {
                // If the condition is met, increment the counter for valid combinations.
                distinctValidCombinations += 1;
            }
        }
    }

    // 3. Output Result
    // Display the final count of distinct valid combinations found.
    // No division by 0.5 is needed due to the optimized loop structure.
    console.log(distinctValidCombinations);
}

// --- Type III Addition: Robust Execution Context with Error Handling ---
// This part handles the execution of the function by reading input from a file,
// typically standard input in competitive programming environments.
try {
    const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
    processStructuralMeasurements(fileContent);
} catch (executionError) {
    // Catch and log any errors that occur during file reading or function execution.
    console.error("An error occurred during program execution:", executionError.message);
    // Optionally, provide more details for debugging.
    // console.error(executionError.stack);
}