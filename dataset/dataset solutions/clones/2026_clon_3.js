function processCircularRouteData(rawInputString) {
    const inputLines = rawInputString.trim().split('\n');

    // --- Input Parsing and Initial Validation ---

    if (inputLines.length < 2) {
        console.error("Input error: Not enough lines provided. Expected at least two lines.");
        return;
    }

    const firstLineTokens = inputLines[0].split(' ');
    if (firstLineTokens.length !== 2) {
        console.error("Input error: First line format is incorrect. Expected two numbers (circumference and station count).");
        return;
    }

    const circleCircumference = Number(firstLineTokens[0]);
    const stationCount = Number(firstLineTokens[1]);

    if (isNaN(circleCircumference) || isNaN(stationCount) || circleCircumference <= 0 || stationCount <= 0) {
        console.error("Input error: Invalid numerical values for circumference or station count. Must be positive integers.");
        return;
    }

    const stationPositions = inputLines[1].split(' ').map(Number);

    if (stationPositions.length !== stationCount) {
        console.error(`Input error: Mismatch between declared station count (${stationCount}) and actual station positions found (${stationPositions.length}).`);
        return;
    }

    // --- Calculating All Segment Lengths ---

    // This array will store the lengths of all segments between stations.
    const allSegmentLengths = [];

    // Iterate through the stations to calculate the distances between adjacent ones.
    // This loop handles all segments except the one that wraps around the circle.
    for (let currentStationIndex = 0; currentStationIndex < stationCount - 1; currentStationIndex++) {
        const startOfSegment = stationPositions[currentStationIndex];
        const endOfSegment = stationPositions[currentStationIndex + 1];
        const segmentLength = endOfSegment - startOfSegment;
        allSegmentLengths.push(segmentLength);
    }

    // Calculate the length of the segment that connects the last station back to the first.
    // This is crucial for circular path problems.
    const wrapAroundSegment = circleCircumference - stationPositions[stationCount - 1] + stationPositions[0];
    allSegmentLengths.push(wrapAroundSegment);

    // --- Determining the Longest Gap and Final Result ---

    // Find the maximum length among all calculated segments.
    // This represents the largest 'gap' in the circle.
    const longestGapFound = Math.max(...allSegmentLengths);

    // The problem asks for the minimum travel distance if the longest segment is removed.
    // This is equivalent to the total circumference minus the length of the longest segment.
    const minimumRemainingPath = circleCircumference - longestGapFound;

    // Output the final calculated value.
    console.log(minimumRemainingPath);
}

// --- Execution Entry Point ---

// Self-invoking function to handle input reading and main program execution.
(function initializeProgram() {
    // Check if the environment supports Node.js 'fs' module for reading standard input.
    if (typeof require === 'function' && typeof module === 'object' && module.exports) {
        try {
            const fileSystem = require("fs");
            const standardInputData = fileSystem.readFileSync("/dev/stdin", "utf8");
            // Call the main processing function with the read input.
            processCircularRouteData(standardInputData);
        } catch (error) {
            console.error("Error reading from /dev/stdin:", error.message);
            // In case of an error reading input, provide a helpful message.
        }
    } else {
        // This path is for environments where 'fs' module is not available (e.g., browsers).
        console.warn("Standard input reading via 'fs' module is not supported in this environment.");
        console.warn("Please ensure the script is run in a Node.js environment or adapt input method.");
    }
})();