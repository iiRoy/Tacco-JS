function processInputData(rawInputText) {
    // Trim whitespace and split the input into individual lines.
    // This ensures consistency even with trailing newlines.
    const allInputLines = rawInputText.trim().split('\n');

    // Parse the first line to get the total number of segments.
    // Using Number() for explicit type conversion.
    const numberOfIntervals = Number(allInputLines[0]);

    // Handle edge case: no intervals provided.
    // This is an added guard clause.
    if (numberOfIntervals === 0) {
        console.log("0"); // Output 0 if no segments.
        return 0;
    }

    // Extract segment data from the input lines.
    // We slice the array to get only the lines containing segment information,
    // starting from the second line (index 1) up to the number of intervals.
    const segmentLines = allInputLines.slice(1, numberOfIntervals + 1);

    const intervalCollection = [];

    // Manually parse each segment line.
    // Using a for...of loop instead of map for a different structural approach.
    for (const line of segmentLines) {
        const parts = line.split(' ');
        // Ensure parsing to integers for positions and lengths.
        const position = Number(parts[0]);
        const length = Number(parts[1]);
        intervalCollection.push([position, length]);
    }

    // Sort the segments primarily by their central position (pos).
    // This is crucial for the greedy approach.
    intervalCollection.sort((segA, segB) => segA[0] - segB[0]);

    // Initialize the count of distinct active regions.
    // If there's at least one interval, we start with one active region.
    let resultCount = 1;

    // Calculate the initial rightmost boundary of the first active region.
    // This is based on the first segment's position plus its length.
    let currentActiveBoundary = intervalCollection[0][0] + intervalCollection[0][1];

    // Iterate through the remaining segments starting from the second one.
    // Using a traditional for loop with a descriptive index name.
    for (let intervalIndex = 1; intervalIndex < numberOfIntervals; ++intervalIndex) {
        const currentSegment = intervalCollection[intervalIndex];
        const segmentPosition = currentSegment[0];
        const segmentLength = currentSegment[1];

        // Calculate the "leftward reach" of the current segment.
        // This is the minimum coordinate covered by the segment.
        const segmentLeftReach = segmentPosition - segmentLength;

        // Calculate the "rightward end" of the current segment.
        // This is the maximum coordinate covered by the segment.
        const segmentRightEnd = segmentPosition + segmentLength;

        // Decision logic:
        // If the current active region's boundary extends beyond the current segment's
        // leftward reach, it means the current segment either overlaps with or
        // touches the existing active region.
        if (currentActiveBoundary > segmentLeftReach) {
            // In this case, we can potentially merge the current segment into the
            // existing active region. We update the active region's right boundary
            // to be the minimum of its current value and the current segment's
            // right end. This greedy choice aims to keep the active region as
            // short as possible to allow more subsequent segments to be merged.
            currentActiveBoundary = Math.min(currentActiveBoundary, segmentRightEnd);
        } else {
            // If the current active region's boundary does not extend beyond
            // the current segment's leftward reach, it means the current segment
            // is sufficiently separated from the previous active region.
            // Therefore, we must start a new distinct active region.
            resultCount++; // Increment the count of distinct regions.
            // The new active region's boundary is set to the current segment's
            // right end.
            currentActiveBoundary = segmentRightEnd;
        }
    }

    // Output the final count of distinct active regions to standard output.
    console.log(String(resultCount));
    // The function also returns the result for potential external use or testing.
    return resultCount;
}

function validateTestCases(testCaseNumber) {
    let testResult = "FAILED"; // Initial pessimistic result.
    try {
        // Construct IDs for input and output elements.
        const inputElementId = `input${testCaseNumber}`;
        const outputElementId = `output${testCaseNumber}`;
        const resultElementId = `result${testCaseNumber}`;

        // Safely retrieve input and expected output elements using querySelector.
        const inputElement = document.querySelector(`#${inputElementId}`);
        const outputElement = document.querySelector(`#${outputElementId}`);
        const resultDisplayElement = document.querySelector(`#${resultElementId}`);

        // Validate that elements exist before proceeding.
        if (!inputElement || !outputElement || !resultDisplayElement) {
            throw new Error(`One or more required DOM elements for test case ${testCaseNumber} not found.`);
        }

        const testInputData = inputElement.value;
        const expectedOutputStr = outputElement.value.trim().split('\n')[0];
        const expectedOutput = Number(expectedOutputStr); // Convert to number for strict comparison.

        // Execute the main processing function with the test input.
        const actualResult = processInputData(testInputData);

        // Compare the actual result with the expected output.
        if (Number.isFinite(actualResult) && actualResult === expectedOutput) {
            testResult = "PASSED"; // If they match, the test passes.
        } else {
            testResult = `FAILED (Expected: ${expectedOutput}, Got: ${actualResult})`;
        }

        // Update the result display element with the outcome.
        resultDisplayElement.textContent = testResult;
        resultDisplayElement.style.color = (testResult === "PASSED") ? "green" : "red";

    } catch (error) {
        console.error(`Error during test case validation for ${testCaseNumber}:`, error);
        // If an error occurs, mark the test as failed and display the error.
        const resultDisplayElement = document.querySelector(`#result${testCaseNumber}`);
        if (resultDisplayElement) {
            resultDisplayElement.textContent = `ERROR: ${error.message}`;
            resultDisplayElement.style.color = "red";
        }
    }
}

// Entry point for competitive programming environments (e.g., Node.js with /dev/stdin)
// This part is kept similar as it's environment-specific boilerplate.
// The rawInputText is passed to the main processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));