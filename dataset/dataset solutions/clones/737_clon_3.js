const fileSystem = require('fs');

/**
 * Executes a single elimination scenario based on provided configuration.
 * This function simulates a process where participants are eliminated in a circle.
 *
 * @param {number[]} scenarioConfig - An array containing [totalParticipants, eliminationStep, initialEliminatedPosition].
 *   - totalParticipants: The total number of participants (N).
 *   - eliminationStep: The 'm' count for elimination.
 *   - initialEliminatedPosition: The starting position (S) that is immediately eliminated.
 */
function processCircularElimination(scenarioConfig) {
    // Destructure the configuration array for clarity and direct access.
    const [totalParticipants, eliminationStep, initialEliminatedPosition] = scenarioConfig;

    // Initialize a boolean array to represent the status of each participant.
    // participantStatus[0] is unused as participant numbers are 1-based.
    // All participants are initially marked as present (true).
    const participantStatus = new Array(totalParticipants + 1).fill(true);

    // The first participant, specified by 'initialEliminatedPosition', is removed at the start.
    // This participant does not count towards the 'eliminationStep' count.
    participantStatus[initialEliminatedPosition] = false;

    // Initialize a counter for the total number of participants eliminated so far.
    // It starts at 1 because the 'initialEliminatedPosition' participant is already out.
    let totalEliminatedCount = 1;

    // Initialize the current position in the circular arrangement.
    // The counting process starts from the position where the first participant was removed.
    let currentTraversalPosition = initialEliminatedPosition;

    // Initialize a counter for how many *active* participants have been skipped
    // in the current round of counting towards the 'eliminationStep'.
    let activeParticipantsSkipped = 0;

    // The total number of participants that need to be eliminated through the counting process.
    // We stop when only one participant remains. Since one is already eliminated,
    // we need to eliminate (totalParticipants - 1) more.
    const requiredEliminationsByCounting = totalParticipants - 1;

    // Main loop: Continue until the target number of participants have been eliminated by counting.
    // This condition ensures that exactly one participant will remain at the end.
    while (totalEliminatedCount < requiredEliminationsByCounting) {
        // Move to the next position in the circle.
        currentTraversalPosition++;

        // Handle circular wrap-around: if the position exceeds the total, reset to 1.
        if (currentTraversalPosition > totalParticipants) {
            currentTraversalPosition = 1;
        }

        // Check if the participant at the 'currentTraversalPosition' is still active (not eliminated).
        if (participantStatus[currentTraversalPosition]) {
            // If active, increment the counter for skipped participants in this round.
            activeParticipantsSkipped++;

            // If the 'eliminationStep' count has been reached for active participants...
            if (activeParticipantsSkipped === eliminationStep) {
                // Mark this participant as eliminated.
                participantStatus[currentTraversalPosition] = false;

                // Reset the skipped counter for the next elimination round.
                activeParticipantsSkipped = 0;

                // Increment the overall count of eliminated participants.
                totalEliminatedCount++;
            }
        }
    }

    // After the loop, only one participant should remain.
    // Iterate through the participant status array to find and print the index of the survivor.
    for (let participantIndex = 1; participantIndex <= totalParticipants; participantIndex++) {
        if (participantStatus[participantIndex]) {
            console.log(participantIndex);
            // Once the survivor is found, we can exit the loop.
            break;
        }
    }
}


// --- Main Program Execution ---

// Read all raw input data from standard input ('/dev/stdin').
// The input is expected to be UTF-8 encoded.
const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');

// Process the raw input:
// 1. Trim any leading/trailing whitespace from the entire input.
// 2. Split the input into an array of lines based on the newline character.
const processedInputLines = rawInputData.trim().split("\n");

// Iterate over each line in the processed input.
// Each line represents a distinct elimination scenario.
for (const lineEntry of processedInputLines) {
    // Parse the current line:
    // 1. Split the line by spaces to get individual string components.
    // 2. Map each string component to its numerical equivalent.
    const currentScenarioValues = lineEntry.split(" ").map(Number);

    // Check for the termination condition: "0 0 0".
    // This explicitly checks if all three numerical values are zero,
    // which is a more robust check than string comparison.
    if (currentScenarioValues[0] === 0 && currentScenarioValues[1] === 0 && currentScenarioValues[2] === 0) {
        // If the termination line is encountered, break out of the loop.
        break;
    }

    // If it's not the termination line, process the scenario.
    processCircularElimination(currentScenarioValues);
}