const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = fileContent.trim().split("\n");

const TERMINATION_SEQUENCE_INDICATOR = "0 0 0";

// This helper function encapsulates the core logic for a single Josephus variant problem.
const calculateRemainingParticipant = (totalParticipants, skipCount, initialEliminationPosition) => {
    // Initialize an array to track the status of each participant.
    // Index 0 is unused, so the array size is `totalParticipants + 1`.
    // All participants are initially considered active (true).
    const participantStatus = new Array(totalParticipants + 1).fill(true);

    // As per the problem's specific rules, the participant at `initialEliminationPosition`
    // is the very first one to be eliminated.
    participantStatus[initialEliminationPosition] = false;
    let eliminatedCount = 1; // One participant has already been removed.

    let currentScanIndex = initialEliminationPosition; // Start scanning from this position.
    let activeSkippedCounter = 0; // Counts active participants encountered since the last elimination.

    // The simulation continues until `totalParticipants - 1` participants have been eliminated.
    // This ensures that exactly one participant remains.
    const targetEliminations = totalParticipants - 1;

    // Loop until the required number of eliminations (excluding the first one) has occurred.
    while (eliminatedCount < targetEliminations) {
        currentScanIndex++; // Move to the next position in the circle.

        // If the index goes beyond the last participant, wrap around to the first participant.
        if (currentScanIndex > totalParticipants) {
            currentScanIndex = 1;
        }

        // Check if the participant at the `currentScanIndex` is still active.
        if (participantStatus[currentScanIndex]) {
            activeSkippedCounter++; // Increment the counter for active participants skipped.

            // If `skipCount` active participants have been skipped, it's time for an elimination.
            if (activeSkippedCounter === skipCount) {
                participantStatus[currentScanIndex] = false; // Mark this participant as eliminated.
                activeSkippedCounter = 0; // Reset the skip counter for the next round of counting.
                eliminatedCount++; // Increment the total count of eliminated participants.
            }
        }
    }

    // After the loop, only one participant remains active. Find and return their index.
    for (let finalParticipantIndex = 1; finalParticipantIndex <= totalParticipants; finalParticipantIndex++) {
        if (participantStatus[finalParticipantIndex]) {
            return finalParticipantIndex;
        }
    }

    // This line should theoretically not be reached if `totalParticipants` is at least 1.
    // It serves as a fallback for unexpected scenarios.
    return -1;
};

// Main loop to process multiple test cases from the input.
while (true) {
    let currentInputLine = inputLines.shift();

    // Check if the current line is the termination sequence.
    if (currentInputLine === TERMINATION_SEQUENCE_INDICATOR) {
        break; // Exit the loop if the termination sequence is found.
    }

    // Parse the input line, splitting it by spaces and converting parts to numbers.
    const parsedParameters = currentInputLine.split(" ").map(Number);
    const totalParticipants = parsedParameters[0];
    const skipCount = parsedParameters[1];
    const initialEliminationPosition = parsedParameters[2];

    // Call the helper function to solve the problem for the current set of parameters
    // and print the index of the last remaining participant.
    const resultParticipant = calculateRemainingParticipant(totalParticipants, skipCount, initialEliminationPosition);
    console.log(resultParticipant);
}
