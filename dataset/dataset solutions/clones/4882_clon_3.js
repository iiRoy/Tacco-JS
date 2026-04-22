function AnalyzeNumericSequence(rawInputPayload) {
    // Ensure the input payload is a valid string and not empty
    if (typeof rawInputPayload !== 'string' || rawInputPayload.trim().length === 0) {
        console.error("Input processing error: Provided data payload is empty or malformed.");
        return;
    }

    // Split the entire input string into individual lines
    const processedInputLines = rawInputPayload.split("\n");

    // Verify that we have at least two lines: one for metadata (N) and one for the actual numbers
    if (processedInputLines.length < 2) {
        console.error("Input processing error: Expected at least two lines of data, but fewer were found.");
        return;
    }

    // Although the first line often specifies 'N', we will derive the actual count from the second line's elements.
    // The original code uses N from the first line for array initialization, but then populates based on the second line's length.
    // For robustness, we will directly parse and use the elements from the second line.
    // const designatedElementCount = parseInt(processedInputLines[0].trim().split(" ")[0], 10); // This line is not strictly needed for the core logic.

    // Parse the sequence of numerical values from the second input line.
    // Filter out any potential empty strings that might arise from multiple spaces between numbers.
    const stringifiedNumbers = processedInputLines[1].split(" ").filter(segment => segment.trim() !== '');

    // Convert string representations to integers.
    const numericalSequence = stringifiedNumbers.map(strValue => parseInt(strValue.trim(), 10));

    // Perform a quick check to ensure all parsed values are indeed numbers.
    if (numericalSequence.some(val => isNaN(val))) {
        console.error("Data parsing error: The input sequence contains non-numeric entries.");
        return;
    }

    const actualSequenceLength = numericalSequence.length;

    // Handle edge cases for very short sequences
    if (actualSequenceLength === 0) {
        console.log("0"); // No elements, thus no possible spread.
        return;
    }
    if (actualSequenceLength === 1) {
        console.log("1"); // One element, spread is 0, occurs once.
        return;
    }

    // Initialize variables for tracking the minimum value seen so far,
    // the greatest difference ("spread"), and how many times that greatest spread occurred.
    let historicalMinimumValue = numericalSequence[0];
    let maximumAchievedSpread = 0;
    let occurrencesOfMaxSpread = 0;

    // Iterate through the numerical sequence to compute spreads.
    // The loop starts from the first element, ensuring the minimum is correctly established
    // for the calculation of the current element's spread.
    for (let currentIdx = 0; currentIdx < actualSequenceLength; currentIdx++) {
        const currentDataPoint = numericalSequence[currentIdx];

        // Update the historical minimum if the current data point is smaller.
        // This ensures 'historicalMinimumValue' always holds the minimum from `numericalSequence[0]` up to `numericalSequence[currentIdx]`.
        if (currentDataPoint < historicalMinimumValue) {
            historicalMinimumValue = currentDataPoint;
        }

        // Calculate the "spread" (difference) between the current data point and the lowest point encountered so far.
        const calculatedCurrentSpread = currentDataPoint - historicalMinimumValue;

        // Compare the calculated spread with the maximum spread observed until this point.
        if (calculatedCurrentSpread > maximumAchievedSpread) {
            maximumAchievedSpread = calculatedCurrentSpread;
            occurrencesOfMaxSpread = 1; // A new maximum spread has been found, reset the count.
        } else if (calculatedCurrentSpread === maximumAchievedSpread) {
            occurrencesOfMaxSpread++; // Another instance of the current maximum spread.
        }
        // If calculatedCurrentSpread is less than maximumAchievedSpread, no action is needed.
    }

    // Output the final count of how many times the maximum spread was observed.
    console.log(occurrencesOfMaxSpread.toString());
}

// Standard entry point for competitive programming environments using Node.js
AnalyzeNumericSequence(require("fs").readFileSync("/dev/stdin", "utf8"));