const fileSystemModule = require('fs'); // Renamed module import for clarity

// Read all input data from stdin, decode as UTF-8
let rawInputDataString = fileSystemModule.readFileSync('/dev/stdin', 'utf8'); // Renamed input variable

// Pre-process input: trim leading/trailing whitespace and split into individual lines
// Added a guard for empty input to prevent errors on `trim()` or `split()`.
if (!rawInputDataString || rawInputDataString.trim() === '') {
    // In a real application, you might log an error or exit with a specific code.
    // For this context, we'll simply stop processing if there's no valid input.
    process.exit(0); 
}
const inputLineCollection = rawInputDataString.trim().split("\n"); // Renamed array variable

/**
 * Helper function to parse a string line into an array of integers.
 * Includes basic validation for the number of expected parts and their numeric nature.
 * @param {string} lineString - The string line to parse.
 * @param {number} expectedPartCount - The expected number of numeric parts in the line.
 * @returns {number[]|null} An array of parsed integers, or null if parsing fails.
 */
const extractNumericParameters = (lineString, expectedPartCount = 3) => {
    const parts = lineString.split(" ").map(segment => parseInt(segment.trim(), 10)); // Explicit parseInt with radix
    // Validate that all parts are numbers and the count matches
    if (parts.length !== expectedPartCount || parts.some(isNaN)) {
        return null; // Indicate failure to parse
    }
    return parts;
};

let currentLinePointer = 0; // Tracks the current line being processed from the input collection

// Main processing loop: continues as long as there are lines to read
// and the termination condition "0 0 0" has not been met.
while (currentLinePointer < inputLineCollection.length) {
    const currentTestCaseLine = inputLineCollection[currentLinePointer++]; // Get line and advance pointer

    // Check for the termination condition for the entire program
    if (currentTestCaseLine.trim() === "0 0 0") {
        break; // Exit the main processing loop
    }

    // Attempt to parse the numeric parameters for the current test case
    const simulationParameters = extractNumericParameters(currentTestCaseLine);

    // If parsing failed (e.g., malformed line), skip this test case and move to the next.
    if (simulationParameters === null) {
        continue;
    }

    // Extract individual parameters using descriptive names
    const totalParticipantsCount = simulationParameters[0]; // Corresponds to 'n'
    const eliminationStepInterval = simulationParameters[1]; // Corresponds to 'm'
    const initialEliminatedPosition = simulationParameters[2]; // Corresponds to 'start'

    // Add guard clauses for invalid simulation parameters
    if (totalParticipantsCount <= 0 || eliminationStepInterval <= 0 || 
        initialEliminatedPosition < 1 || initialEliminatedPosition > totalParticipantsCount) {
        // Skip this test case if parameters are nonsensical for the simulation
        continue;
    }

    // Initialize the status of participants.
    // Using Array.from with a callback for a more modern array initialization.
    // Index 0 is intentionally left unused to make participant IDs (1 to N) match array indices.
    const participantStatusArray = Array.from({ length: totalParticipantsCount + 1 }, () => true); // Renamed 'ary'

    // As per the problem's specific rule, the starting participant is immediately removed.
    participantStatusArray[initialEliminatedPosition] = false;
    
    let activeParticipantPointer = initialEliminatedPosition; // Renamed 'i', represents current position in circle
    let currentStepCounter = 0; // Renamed 'j', counts steps for elimination
    let currentlyEliminatedCount = 1; // Renamed 'cnt', starts at 1 because initialEliminatedPosition is out

    // The simulation continues until only one participant remains.
    // This means N-1 participants must be eliminated.
    const requiredEliminations = totalParticipantsCount - 1;

    // Core simulation loop: continues until the target number of eliminations is reached
    while (currentlyEliminatedCount < requiredEliminations) {
        // Move the pointer to the next position in the circular arrangement
        activeParticipantPointer++;
        // Wrap around if the pointer exceeds the total number of participants
        if (activeParticipantPointer > totalParticipantsCount) {
            activeParticipantPointer = 1;
        }

        // Check if the participant at the current pointer position is still in the game
        if (participantStatusArray[activeParticipantPointer]) {
            currentStepCounter++; // Increment the step counter

            // If the step counter reaches the elimination interval, remove this participant
            if (currentStepCounter === eliminationStepInterval) {
                participantStatusArray[activeParticipantPointer] = false; // Mark as eliminated
                currentStepCounter = 0; // Reset the counter for the next elimination round
                currentlyEliminatedCount++; // Increment the total count of eliminated participants
            }
        }
        // If the participant is already eliminated, we simply skip them and continue counting steps.
    }

    // After the simulation, iterate through the participant status array
    // and print the identifier(s) of the remaining active participant(s).
    // The problem implies only one will remain, but the original code iterates.
    for (let pId = 1; pId <= totalParticipantsCount; pId++) { // Renamed 'i' for output loop
        if (participantStatusArray[pId]) {
            console.log(pId);
        }
    }
}