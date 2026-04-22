const STANDARD_INPUT_SOURCE_PATH = '/dev/stdin';
const systemInputModule = require('fs');

// Raw content read from the standard input stream
const rawSystemInputContent = systemInputModule.readFileSync(STANDARD_INPUT_SOURCE_PATH, 'utf8');

// Process the raw input: remove leading/trailing whitespace and split into an array of lines
let inputDataLines = rawSystemInputContent.trim().split('\n');

// Define the specific string that signals the end of input data processing
const PROCESSING_TERMINATOR_SEQUENCE = "0 0";

/**
 * A utility function to safely parse a string containing space-separated numbers
 * into an array of numeric values. Includes basic validation.
 * @param {string} lineToParse The string expected to contain numbers.
 * @returns {number[]} An array of parsed numbers. Returns an empty array if input is invalid.
 */
function extractNumericValues(lineToParse) {
    // Implement a guard clause for empty or malformed input lines
    if (!lineToParse || typeof lineToParse !== 'string' || lineToParse.trim() === '') {
        console.warn("Attempted to parse an empty or invalid numeric line.");
        return [];
    }
    // Split the string by spaces and convert each part to a number
    return lineToParse.split(' ').map(Number);
}

// Main operational loop for processing multiple competition datasets
// This loop continues indefinitely until a specific termination condition is met
while (true) {
    // Fetch the next line, which should contain the participant and round counts
    const competitionSizeDescriptorLine = inputDataLines.shift();

    // Check if the retrieved line matches the defined termination sequence
    if (competitionSizeDescriptorLine === PROCESSING_TERMINATOR_SEQUENCE) {
        // If it matches, gracefully exit the processing loop
        break;
    }

    // Parse the descriptor line to get the number of rounds and participants
    const parsedCompetitionDimensions = extractNumericValues(competitionSizeDescriptorLine);

    // Validate that exactly two dimension values (rounds, participants) were provided
    if (parsedCompetitionDimensions.length !== 2) {
        console.error(`Error: Malformed competition dimension line encountered: "${competitionSizeDescriptorLine}". Skipping this data block.`);
        // Skip to the next iteration of the loop if the dimensions are invalid
        continue;
    }

    // Assign the extracted dimension values to clearly named constants
    const totalNumberOfRounds = parsedCompetitionDimensions[0];
    const totalNumberOfParticipants = parsedCompetitionDimensions[1];

    // Initialize an array to hold data for each participant.
    // Each participant object will track their unique ID and their cumulative score.
    // Using Array.from for a more functional and concise initialization.
    const participantPerformanceRecords = Array.from({ length: totalNumberOfParticipants }, (_, index) => ({
        participantUniqueId: index + 1, // Participant IDs are typically 1-based
        cumulativePointTotal: 0         // Start each participant's score at zero
    }));

    // Iterate through each round to accumulate scores for all participants
    for (let currentRoundIndex = 0; currentRoundIndex < totalNumberOfRounds; currentRoundIndex++) {
        // Retrieve and parse the scores submitted for the current round
        const scoresForThisRound = extractNumericValues(inputDataLines.shift());

        // Perform a validation check to ensure the number of scores matches the expected participant count
        if (scoresForThisRound.length !== totalNumberOfParticipants) {
            console.warn(`Warning: Score count mismatch in round ${currentRoundIndex + 1}. Expected ${totalNumberOfParticipants} scores, but received ${scoresForThisRound.length}. Skipping this round's data.`);
            // Continue to the next round if the data is incomplete or malformed
            continue;
        }

        // Update each participant's cumulative score with their score from the current round
        // Using a traditional for loop for direct indexed access, which can be clearer for this update pattern.
        for (let participantIndex = 0; participantIndex < totalNumberOfParticipants; participantIndex++) {
            participantPerformanceRecords[participantIndex].cumulativePointTotal += scoresForThisRound[participantIndex];
        }
    }

    // Sort the participant records based on their cumulative scores in ascending order.
    // The comparison function is simplified to directly return the difference,
    // which is standard practice for numeric ascending sorts.
    participantPerformanceRecords.sort((participantOne, participantTwo) => {
        return participantOne.cumulativePointTotal - participantTwo.cumulativePointTotal;
    });

    // After sorting, extract only the unique identifiers of the participants
    // The map function provides a clean way to transform the array of objects into an array of IDs.
    const orderedParticipantIdentifiers = participantPerformanceRecords.map(
        (participantEntry) => participantEntry.participantUniqueId
    );

    // Output the final ordered list of participant identifiers, joined by spaces
    // The console.log function automatically adds a newline character at the end.
    console.log(orderedParticipantIdentifiers.join(' '));
}
// This comment marks the logical conclusion of the script's execution.