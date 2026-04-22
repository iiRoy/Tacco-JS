"use strict";

// This mapping defines the complementary color for a given color.
// Renamed 'v' to 'colorComplementMap' for improved readability.
const colorComplementMap = { "R": "B", "B": "R" };

// Initialize the readline interface to handle standard input and output.
// Renamed 'rl' to 'ioManager' to reflect its role in managing I/O.
const ioManager = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout
});

// The core problem-solving logic is implemented as a generator function
// to manage asynchronous interactions (reading input, printing queries).
// Renamed 'g' to 'solutionProcessor' for better semantic meaning.
const solutionProcessor = (function* () {

    // Helper function to abstract the asynchronous reading of a single line from input.
    // Renamed 'gets' to 'retrieveInputLine'.
    const retrieveInputLine = () => new Promise(resolve => ioManager.once("line", resolve));

    // This array will store the final sequence of determined colors.
    // Renamed 'ans' to 'finalColorSequence'.
    const finalColorSequence = [];

    // Retrieve the initial sequence length from the input.
    // Renamed 'n' to 'sequenceLengthVal'.
    let sequenceLengthVal = yield retrieveInputLine();

    // Parse the input string to an integer and perform basic validation.
    sequenceLengthVal = parseInt(sequenceLengthVal, 10);
    if (isNaN(sequenceLengthVal) || sequenceLengthVal <= 0) {
        console.error("Error: Invalid or non-positive sequence length provided.");
        ioManager.close();
        return; // Exit the routine on invalid input
    }

    // Calculate the total number of elements, which is twice the sequence length.
    // Renamed 'n2' to 'totalElementCount'.
    const totalElementCount = 2 * sequenceLengthVal;

    // Array to construct the primary query pattern. It will contain 'sequenceLengthVal' elements.
    // Renamed 'p' to 'mainQueryPattern'.
    const mainQueryPattern = new Array(sequenceLengthVal);

    // Populate the initial main query pattern with a simple arithmetic sequence (1 to sequenceLengthVal).
    for (let currentIdx = 0; currentIdx < sequenceLengthVal; currentIdx++) {
        mainQueryPattern[currentIdx] = currentIdx + 1;
    }

    // Send the first query to the external system and await its response.
    console.log("?", mainQueryPattern.join(" "));
    // Renamed 's' to 'initialFeedback'.
    const initialFeedback = yield retrieveInputLine();

    // Extract the first character of the initial response.
    // Added a check for empty feedback.
    const primaryColorIndicator = initialFeedback.charAt(0);
    if (!primaryColorIndicator) {
        console.error("Error: Received empty response for the initial query.");
        ioManager.close();
        return;
    }

    // Variables for the binary search process.
    // Renamed 'l' to 'searchLowerBoundary', 'r' to 'searchUpperBoundary'.
    let searchLowerBoundary = 1;
    let searchUpperBoundary = sequenceLengthVal + 1; // Upper boundary is exclusive.

    // Variable to store the key value identified by the binary search.
    // Renamed 'x' to 'identifiedPivotValue'.
    let identifiedPivotValue;

    // Execute a binary search algorithm to pinpoint a critical 'identifiedPivotValue'.
    while (searchUpperBoundary - searchLowerBoundary > 1) {
        // Calculate the midpoint. Using Math.floor for explicit integer division.
        // Original: x = r+l+1>>1;
        identifiedPivotValue = Math.floor((searchUpperBoundary + searchLowerBoundary + 1) / 2);

        // Construct a new query pattern based on the current 'identifiedPivotValue'.
        for (let currentIdx = 0; currentIdx < sequenceLengthVal; currentIdx++) {
            mainQueryPattern[currentIdx] = identifiedPivotValue + currentIdx;
        }

        // Submit the new query and obtain a response.
        console.log("?", mainQueryPattern.join(" "));
        // Renamed 't' to 'currentQueryFeedback'.
        const currentQueryFeedback = yield retrieveInputLine();

        // Extract the first character of the current response.
        // Added a check for empty feedback.
        const feedbackColorIndicator = currentQueryFeedback.charAt(0);
        if (!feedbackColorIndicator) {
            console.error("Error: Received empty response during binary search.");
            ioManager.close();
            return;
        }

        // Adjust the search boundaries based on the comparison of color indicators.
        if (primaryColorIndicator !== feedbackColorIndicator) {
            searchUpperBoundary = identifiedPivotValue;
        } else {
            searchLowerBoundary = identifiedPivotValue;
        }
    }

    // The 'identifiedPivotValue' is confirmed as the final 'searchLowerBoundary'.
    identifiedPivotValue = searchLowerBoundary;

    // Determine the 0-indexed positions in the result sequence based on the pivot.
    const firstCalculatedIndex = identifiedPivotValue - 1; // For 0-indexed array
    const secondCalculatedIndex = identifiedPivotValue - 1 + sequenceLengthVal; // For 0-indexed array

    // Populate the 'finalColorSequence' at these two known positions.
    // Added boundary checks for robustness.
    if (firstCalculatedIndex >= 0 && firstCalculatedIndex < totalElementCount &&
        secondCalculatedIndex >= 0 && secondCalculatedIndex < totalElementCount) {
        finalColorSequence[firstCalculatedIndex] = primaryColorIndicator;
        finalColorSequence[secondCalculatedIndex] = colorComplementMap[primaryColorIndicator];
    } else {
        console.error(`Error: Calculated indices (${firstCalculatedIndex}, ${secondCalculatedIndex}) are out of bounds for the result sequence.`);
        ioManager.close();
        return;
    }

    // Array for constructing the secondary query pattern.
    // Renamed 'q' to 'alternateQueryPattern'.
    const alternateQueryPattern = new Array(sequenceLengthVal);

    // A Set to efficiently store elements that are part of the primary pattern (1-indexed values).
    // Renamed 'set' to 'membersOfPrimaryPattern'.
    const membersOfPrimaryPattern = new Set();

    // Populate the initial 'sequenceLengthVal - 1' elements of both query patterns.
    for (let currentIdx = 0; currentIdx < sequenceLengthVal - 1; currentIdx++) {
        // Calculate the 1-indexed value for the primary pattern, ensuring it wraps around totalElementCount.
        // Original: p[i] = (x+i) % (2*n); This was problematic as it could yield 0.
        // Corrected to ensure 1-indexed values: ((value - 1) % totalElementCount) + 1.
        const currentMainPatternValue = ((identifiedPivotValue + currentIdx - 1) % totalElementCount) + 1;
        mainQueryPattern[currentIdx] = currentMainPatternValue;

        // Calculate the 1-indexed value for the alternate pattern, ensuring proper wrapping.
        // Original: q[i] = (p[i]+n-1) % (2*n)+1;
        const currentAlternatePatternValue = ((currentMainPatternValue + sequenceLengthVal - 1 - 1) % totalElementCount) + 1;
        alternateQueryPattern[currentIdx] = currentAlternatePatternValue;

        // Add the 1-indexed primary pattern value to the set for quick lookups.
        membersOfPrimaryPattern.add(currentMainPatternValue);
    }

    // Iterate through all possible element values (from 1 to totalElementCount)
    // to determine the colors for the remaining unknown positions.
    for (let elementToProbe = 1; elementToProbe <= totalElementCount; elementToProbe++) {
        // If the color for this element is already known, skip to the next.
        if (finalColorSequence[elementToProbe - 1]) { // Convert 1-indexed element to 0-indexed array index.
            continue;
        }

        let activeQueryArray; // This will hold the pattern used for the current query.

        // Decide which query pattern to use: 'mainQueryPattern' or 'alternateQueryPattern'.
        // This decision depends on whether 'elementToProbe' is found in 'membersOfPrimaryPattern'.
        if (membersOfPrimaryPattern.has(elementToProbe)) {
            // If it's a member, use the alternate pattern, placing 'elementToProbe' at its last slot.
            alternateQueryPattern[sequenceLengthVal - 1] = elementToProbe;
            activeQueryArray = alternateQueryPattern;
        } else {
            // Otherwise, use the main pattern, placing 'elementToProbe' at its last slot.
            mainQueryPattern[sequenceLengthVal - 1] = elementToProbe;
            activeQueryArray = mainQueryPattern;
        }

        // Send the constructed query and wait for the response.
        console.log("?", activeQueryArray.join(" "));
        const probeResponse = yield retrieveInputLine();

        // Extract the color from the response.
        // Added a check for empty response.
        const receivedColorForProbe = probeResponse.charAt(0);
        if (!receivedColorForProbe) {
            console.error(`Error: Received empty response when probing element ${elementToProbe}.`);
            ioManager.close();
            return;
        }

        // Assign the received color to the corresponding 0-indexed position in the final sequence.
        finalColorSequence[elementToProbe - 1] = receivedColorForProbe;
    }

    // All colors have been determined. Output the final sequence.
    console.log("!", finalColorSequence.join(""));

    // Close the I/O manager as the task is complete.
    ioManager.close();
})();

// Initiate the execution of the generator function.
solutionProcessor.next();