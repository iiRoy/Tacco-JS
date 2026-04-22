const fileSystemInterface = require('fs');

// Read all input data from the standard input stream.
// The data is expected to be UTF-8 encoded.
// Any leading or trailing whitespace is removed, and the content is split into an array of lines.
const rawInputBuffer = fileSystemInterface.readFileSync('/dev/stdin', 'utf8');
const instructionLines = rawInputBuffer.trim().split('\n');

// Initialize an index to keep track of the current line being processed from the input array.
let currentLinePointer = 0;

// Begin the primary loop to process each test case.
// This loop continues indefinitely until a specific termination condition is met.
while (true) {
    // Retrieve the next line of data from the input array and then advance the pointer.
    const currentDataSet = instructionLines[currentLinePointer++];

    // Check if the current line signals the end of input.
    // The problem statement specifies "0 0" as the termination sequence.
    if (currentDataSet === '0 0') {
        // If the termination signal is found, exit the main processing loop.
        break;
    }

    // Parse the numbers from the current line.
    // The line is expected to contain two space-separated integers: N (total participants) and M (elimination step).
    const [participantCount, eliminationStep] = currentDataSet.split(' ').map(Number);

    // --- Type III: Added a guard clause for invalid input parameters. ---
    // If the number of participants or the elimination step is non-positive,
    // this test case is considered invalid and is skipped.
    if (participantCount < 1 || eliminationStep < 1) {
        // For competitive programming, simply continue to the next test case.
        // In a production system, one might log an error or throw an exception.
        continue;
    }

    // Initialize the circular arrangement of participants.
    // An array `activeCircle` is used where `activeCircle[i]` is `true` if participant `i` is still in the game,
    // and `false` if eliminated. The array is 1-indexed, so `activeCircle[0]` is unused (set to false).
    const activeCircle = Array.from({ length: participantCount + 1 }, (_, participantId) => participantId > 0);

    // Initialize control variables for the Josephus simulation.
    let currentPersonIdx = 0; // Tracks the current position in the circle (1-based participant ID).
    let stepsTaken = 0;       // Counts active participants skipped since the last elimination.
    let removedCount = 0;     // Total number of participants eliminated so far.

    // Execute the Josephus elimination simulation.
    // The loop continues until only one participant remains.
    // This condition is met when `participantCount - 1` individuals have been removed.
    while (removedCount < participantCount - 1) {
        // Advance to the next potential participant in the circle.
        currentPersonIdx++;

        // If the index goes beyond the total number of participants, wrap around to the first participant.
        if (currentPersonIdx > participantCount) {
            currentPersonIdx = 1;
        }

        // Check if the participant at the current index is still active (not yet eliminated).
        if (activeCircle[currentPersonIdx]) {
            // If the participant is active, increment the step counter.
            stepsTaken++;

            // If the step counter reaches the specified elimination step, this participant is removed.
            if (stepsTaken === eliminationStep) {
                // Mark the participant as eliminated.
                activeCircle[currentPersonIdx] = false;
                // Reset the step counter for the next elimination cycle.
                stepsTaken = 0;
                // Increment the total count of removed participants.
                removedCount++;
            }
        }
    }

    // After the simulation concludes, iterate through the participants to find the sole survivor.
    // There will be exactly one participant whose status in `activeCircle` is `true`.
    for (let survivorCandidate = 1; survivorCandidate <= participantCount; survivorCandidate++) {
        if (activeCircle[survivorCandidate]) {
            // Output the ID of the surviving participant.
            console.log(survivorCandidate);
            // Since only one survivor is expected, break the loop once found.
            break;
        }
    }
}