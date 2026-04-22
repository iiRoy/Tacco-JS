const fileSystemModule = require('fs');

// Read raw input from standard input file descriptor
const rawBufferContent = fileSystemModule.readFileSync('/dev/stdin');

// Convert buffer to a UTF-8 string
const decodedTextContent = rawBufferContent.toString('utf8');

// Remove leading/trailing whitespace from the entire content
const trimmedInputData = decodedTextContent.trim();

// Split the content into an array of individual lines
const inputDataLines = trimmedInputData.split('\n');

// Initialize an index for iterating through the input lines
let lineProcessingIndex = 0;

// Process each line of input data
while (lineProcessingIndex < inputDataLines.length) {
    // Retrieve the current line string
    const activeLineString = inputDataLines[lineProcessingIndex];
    lineProcessingIndex++; // Advance to the next line for the subsequent iteration

    // Skip empty or purely whitespace lines
    if (!activeLineString || activeLineString.trim() === '') {
        continue;
    }

    // Split the current line by space to get numerical tokens
    const numericalStringTokens = activeLineString.split(' ');

    // Ensure there are at least two tokens for N and M
    if (numericalStringTokens.length < 2) {
        continue;
    }

    // Parse the first token as the total number of participants
    let numberOfParticipants = Number.parseInt(numericalStringTokens[0], 10);
    // Parse the second token as the elimination step count
    let eliminationCycleStep = Number.parseInt(numericalStringTokens[1], 10);

    // Validate if the parsed values are actual numbers
    if (Number.isNaN(numberOfParticipants) || Number.isNaN(eliminationCycleStep)) {
        continue;
    }

    // Check for the termination condition (0 0)
    const isTerminationSignal = (numberOfParticipants === 0 && eliminationCycleStep === 0);
    if (isTerminationSignal) {
        break; // Exit the main processing loop
    }

    // Initialize the list of participants (from 1 to N)
    // Using Array.from for concise array creation
    let participantCircleList = Array.from({ length: numberOfParticipants }, (_, currentPersonIdx) => currentPersonIdx + 1);

    // Initialize the starting position for elimination in the circle
    let currentEliminationPoint = 0;

    // Simulate the Josephus problem until only one participant remains
    while (participantCircleList.length > 1) {
        const currentCircleSize = participantCircleList.length;

        // Calculate the index of the person to be eliminated
        // The formula accounts for the circular nature and the step count
        currentEliminationPoint = (currentEliminationPoint + eliminationCycleStep - 1) % currentCircleSize;

        // Remove the participant at the calculated index
        participantCircleList.splice(currentEliminationPoint, 1);

        // Adjust the elimination point for the next round if it's now out of bounds
        // (e.g., if the last element was removed, the point should wrap to the beginning)
        currentEliminationPoint = currentEliminationPoint % participantCircleList.length;
    }

    // Output the identifier of the last remaining participant
    console.log(participantCircleList[0]);
}