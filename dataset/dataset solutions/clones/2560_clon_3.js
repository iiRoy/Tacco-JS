function analyzeGameResults(rawInputDataBuffer) {
    // --- Input Validation and Preprocessing (Added Type III) ---
    // Ensure the input buffer is not empty or invalid.
    if (!rawInputDataBuffer || typeof rawInputDataBuffer !== 'string' || rawInputDataBuffer.trim().length === 0) {
        console.error("Execution Aborted: Provided input data is either empty or not in the expected string format.");
        return; // Terminate execution if input is invalid.
    }

    // Split the entire input string into individual lines,
    // filtering out any potential empty lines that might result from extra newlines.
    const allProcessedLines = rawInputDataBuffer
        .split("\n")
        .map(line => line.trim()) // Trim each line
        .filter(line => line.length > 0); // Remove truly empty lines

    // Verify that there's at least a configuration line available.
    if (allProcessedLines.length < 1) {
        console.error("Execution Aborted: No valid configuration or data lines found in the input.");
        return;
    }

    // --- Configuration Parsing (Rewritten Type II & III) ---
    // The first line contains the game's initial setup parameters.
    const initialConfigLine = allProcessedLines[0];
    const parsedNumericalSettings = initialConfigLine.split(" ").map(Number);

    // Validate the number of configuration parameters.
    if (parsedNumericalSettings.length !== 3) {
        console.error(`Execution Aborted: Expected 3 configuration parameters, but detected ${parsedNumericalSettings.length}.`);
        return;
    }

    // Assign parsed settings to descriptive variables for clarity.
    const maximumParticipantIndex = parsedNumericalSettings[0]; // Equivalent to original 'mem[0]'
    const startingScorePerParticipant = parsedNumericalSettings[1]; // Equivalent to original 'mem[1]'
    const initialDeductionPerParticipant = parsedNumericalSettings[2]; // Equivalent to original 'mem[2]'

    // Calculate the base score each participant begins with.
    const netStartingScore = startingScorePerParticipant - initialDeductionPerParticipant;

    // --- Score Tracker Initialization (Rewritten Type II & III) ---
    // Create an array to keep track of scores for all participants.
    // The array size is `maximumParticipantIndex + 1` because participants are 1-indexed.
    // The element at index 0 will remain unused, which simplifies 1-indexed access later.
    const participantScoreLedger = new Array(maximumParticipantIndex + 1);

    // Initialize all participant entries with the calculated net starting score.
    // Using an explicit loop instead of `.fill()` for structural variation.
    for (let currentIdx = 0; currentIdx <= maximumParticipantIndex; currentIdx++) {
        participantScoreLedger[currentIdx] = netStartingScore;
    }

    // --- Processing Score Updates (Rewritten Type II & III) ---
    // Extract the lines that contain participant IDs for score increments.
    // This effectively removes the configuration line without modifying the original array.
    const participantUpdateEvents = allProcessedLines.slice(1);

    // Iterate over each event line to increment the corresponding participant's score.
    participantUpdateEvents.forEach(function(participantIdentifierString) {
        const targetParticipantId = Number(participantIdentifierString);

        // --- Intermediate Validation (Added Type III) ---
        // Ensure the participant ID is a valid number and within the expected range.
        if (isNaN(targetParticipantId) || targetParticipantId < 1 || targetParticipantId > maximumParticipantIndex) {
            console.warn(`Warning: Encountered an invalid or out-of-range participant ID "${participantIdentifierString}". This entry will be skipped.`);
            return; // Skip this invalid entry and continue with the next.
        }

        // Increment the score for the identified participant.
        participantScoreLedger[targetParticipantId]++;
    });

    // --- Final Result Determination and Output (Rewritten Type II & III) ---
    // The original code used `arr.shift()`, which implied processing from index 1.
    // We achieve the same by directly iterating from index 1 to `maximumParticipantIndex`.
    for (let pId = 1; pId <= maximumParticipantIndex; pId++) {
        const finalParticipantScore = participantScoreLedger[pId];
        let outcomeMessage; // Helper variable for clarity.

        // Use an explicit if-else block instead of a ternary operator for structural variation.
        if (finalParticipantScore >= 1) {
            outcomeMessage = "Yes"; // Participant has a winning score.
        } else {
            outcomeMessage = "No"; // Participant's score is too low.
        }
        // Print the determined outcome for the current participant.
        console.log(outcomeMessage);
    }
}

// --- Program Entry Point (Rewritten Type II & III) ---
// This immediately invoked function expression (IIFE) serves as the main entry point.
(function initiateProgramExecution() {
    // Dynamically import the file system module.
    const systemFileHandler = require("fs");
    // Define the standard input file path as a constant.
    const standardInputSourcePath = "/dev/stdin";
    let inputContentFromStream;

    try {
        // Attempt to read the entire content from standard input.
        inputContentFromStream = systemFileHandler.readFileSync(standardInputSourcePath, "utf8");
    } catch (fileReadError) {
        // Catch and report any errors during file reading.
        console.error("Critical Error: Could not read from standard input stream.", fileReadError.message);
        // Exit the program gracefully upon critical error.
        process.exit(1);
    }

    // Pass the raw, trimmed input data to our core analysis function.
    analyzeGameResults(inputContentFromStream.trim());
})();