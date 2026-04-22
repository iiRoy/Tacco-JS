function processNumericalSequenceAnalysis(rawInputString) {
    // --- Input Processing and Validation ---

    // Validate the raw input string to ensure it's not empty or invalid.
    if (!rawInputString || typeof rawInputString !== 'string' || rawInputString.trim() === '') {
        console.error("Error: The provided input string is either empty, not a string, or contains only whitespace.");
        return; // Terminate execution if input is invalid.
    }

    // Split the input into individual lines.
    const inputLines = rawInputString.trim().split('\n');

    // Ensure there are at least two lines for sequence length and data points.
    if (inputLines.length < 2) {
        console.error("Error: Insufficient input lines. Expected at least two lines (length and data).");
        return;
    }

    // Extract the string representations of sequence length and data points.
    const sequenceLengthString = inputLines[0];
    const dataPointsString = inputLines[1];

    // Parse the total count of elements expected in the sequence.
    const expectedSequenceLength = parseInt(sequenceLengthString, 10);
    if (isNaN(expectedSequenceLength) || expectedSequenceLength < 0) {
        console.error("Error: The specified sequence length is invalid or non-numeric.");
        return;
    }

    // Parse the individual numerical values from the second line.
    const initialNumericalValues = dataPointsString.split(' ').map(str => parseInt(str.trim(), 10));

    // Filter out any invalid numbers (NaN or negative) that might result from parsing.
    // Assuming non-negative integers for this problem's context.
    const validatedNumericalValues = initialNumericalValues.filter(num => !isNaN(num) && num >= 0);

    // If the number of validated elements doesn't match the expected length, log a warning.
    // For robustness, we will proceed with the validated count.
    if (validatedNumericalValues.length !== expectedSequenceLength) {
        console.warn(`Warning: Expected ${expectedSequenceLength} elements, but found ${validatedNumericalValues.length} valid elements. Proceeding with validated count.`);
    }

    const actualElementCount = validatedNumericalValues.length;

    // If no valid elements are found, the maximum neighborhood sum is 0.
    if (actualElementCount === 0) {
        console.log(0);
        return;
    }

    // --- Data Analysis ---

    // Determine the maximum value present within the validated dataset.
    const highestObservedNumericValue = Math.max(...validatedNumericalValues);

    // Initialize a frequency map (often called a bucket array) to count occurrences of each number.
    // The size is `highestObservedNumericValue + 2` to safely access indices up to `highestObservedNumericValue + 1`.
    const valueOccurrenceCounts = new Array(highestObservedNumericValue + 2).fill(0);

    // Populate the frequency map by iterating through the validated numerical values.
    for (const currentNumericValue of validatedNumericalValues) {
        // Ensure the value is within the bounds of our frequency map to prevent errors.
        if (currentNumericValue >= 0 && currentNumericValue < valueOccurrenceCounts.length) {
            valueOccurrenceCounts[currentNumericValue]++;
        } else {
            console.warn(`Debug: Value ${currentNumericValue} was outside the expected range for the frequency map.`);
        }
    }

    // This array will store the sum of frequencies for each number and its immediate neighbors (i-1, i, i+1).
    const localDensityMeasures = [];

    // Helper function for safely accessing the frequency map, returning 0 for out-of-bounds indices.
    const getFrequencySafely = (mapArray, index) => {
        if (index >= 0 && index < mapArray.length) {
            return mapArray[index];
        }
        return 0; // Return 0 for indices outside the valid range.
    };

    // Iterate from 0 up to the highest observed value to calculate each neighborhood sum.
    for (let targetIndex = 0; targetIndex <= highestObservedNumericValue; targetIndex++) {
        // Calculate the sum of frequencies for the current target index and its adjacent indices.
        // The getFrequencySafely helper handles the boundary conditions gracefully (e.g., for targetIndex = 0,
        // it correctly treats the 'left' neighbor as having a frequency of 0).
        const frequencyOfLeftNeighbor = getFrequencySafely(valueOccurrenceCounts, targetIndex - 1);
        const frequencyOfCurrentValue = getFrequencySafely(valueOccurrenceCounts, targetIndex);
        const frequencyOfRightNeighbor = getFrequencySafely(valueOccurrenceCounts, targetIndex + 1);

        const currentNeighborhoodSum = frequencyOfLeftNeighbor + frequencyOfCurrentValue + frequencyOfRightNeighbor;
        localDensityMeasures.push(currentNeighborhoodSum);

        // Optional debug logging for insight into intermediate calculations (Type III addition).
        // console.debug(`DEBUG: Target Index ${targetIndex}, Frequencies [${frequencyOfLeftNeighbor}, ${frequencyOfCurrentValue}, ${frequencyOfRightNeighbor}], Sum: ${currentNeighborhoodSum}`);
    }

    // --- Final Result Determination ---

    let overallMaximumDensity = 0; // Initialize the maximum sum found.

    // If localDensityMeasures is not empty, find the highest value within it.
    if (localDensityMeasures.length > 0) {
        overallMaximumDensity = Math.max(...localDensityMeasures);
    } else {
        // This case would typically be caught by earlier checks (e.g., empty input),
        // but it's a good safeguard.
        console.warn("Warning: No local density measures were calculated, result defaults to 0.");
    }

    // Display the final computed maximum sum to the standard output.
    console.log(overallMaximumDensity);
}

// --- Program Execution Entry Point ---
try {
    // Dynamically load the Node.js file system module.
    const fileSystemHandler = require("fs");
    // Define the standard input file path.
    const standardInputPath = "/dev/stdin";

    // Read the entire content of the standard input file synchronously,
    // decoding it as UTF-8 text.
    const rawFileContent = fileSystemHandler.readFileSync(standardInputPath, "utf8");

    // Invoke the main analysis function with the retrieved file content.
    processNumericalSequenceAnalysis(rawFileContent);
} catch (runtimeError) {
    // Catch and report any errors that occur during file reading or function execution.
    console.error(`An unhandled error occurred during program execution: ${runtimeError.message}`);
    // Optionally, exit the process with an error code.
    // process.exit(1);
}