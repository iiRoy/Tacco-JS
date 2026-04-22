const INPUT_FILE_PATH = '/dev/stdin';
const DEFAULT_ENCODING = 'utf8';
const INITIAL_PARTICIPANT_SCORE = 0;
const INVALID_PARTICIPANT_INDEX = -1; // Represents an unassigned or invalid participant index

/**
 * Safely parses a string into an integer.
 * Includes basic validation and returns 0 or throws an error for invalid input.
 * @param {string} inputString - The string to parse.
 * @returns {number} The parsed integer.
 */
const parseNumericString = (inputString) => {
    const parsedValue = parseInt(inputString, 10);
    if (isNaN(parsedValue)) {
        // In a production system, one might throw an error or log more verbosely.
        // For this context, a warning and default value is sufficient.
        console.warn(`[WARNING] Non-numeric data encountered: "${inputString}". Defaulting to 0.`);
        return 0;
    }
    return parsedValue;
};

/**
 * Iterates through an array of scores to determine the participant with the highest score.
 * @param {number[]} scoreArray - An array where each element is a participant's score.
 * @returns {{topScore: number, leaderIdentifier: number}} An object containing the highest score and the index of the leader.
 */
const ascertainCurrentLeader = (scoreArray) => {
    let topScore = -Infinity; // Initialize with a very low value to ensure any real score is higher
    let leaderIdentifier = INVALID_PARTICIPANT_INDEX;

    scoreArray.forEach((currentParticipantScore, participantIdx) => {
        if (currentParticipantScore > topScore) {
            topScore = currentParticipantScore;
            leaderIdentifier = participantIdx;
        }
    });

    return { topScore: topScore, leaderIdentifier: leaderIdentifier };
};

// --- Main Program Execution Flow ---
try {
    const fileSystemHandler = require('fs');
    const rawSystemInput = fileSystemHandler.readFileSync(INPUT_FILE_PATH, DEFAULT_ENCODING);

    // Prepare the input: remove extraneous whitespace and split into distinct lines.
    const processedInputLines = rawSystemInput.trim().split('\n');

    // Perform an initial check on the integrity of the input data.
    if (processedInputLines.length === 0) {
        console.error("[ERROR] Input data stream is unexpectedly empty.");
        process.exit(1); // Terminate with an error code.
    }

    // Extract system configuration from the first line (e.g., number of players, number of queries).
    const configurationLine = processedInputLines.shift();
    const [totalParticipants, totalUpdates] = configurationLine.split(' ').map(parseNumericString);

    // Validate the parsed configuration parameters.
    if (totalParticipants <= 0 || isNaN(totalParticipants) || totalUpdates < 0 || isNaN(totalUpdates)) {
        console.error(`[ERROR] Invalid configuration: Participants=${totalParticipants}, Updates=${totalUpdates}.`);
        process.exit(1);
    }

    // Initialize an array to store scores for each participant.
    // All participants start with a predefined initial score.
    let participantScores = Array.from({ length: totalParticipants }, () => INITIAL_PARTICIPANT_SCORE);

    // Establish the initial leading participant and their score.
    // Since all scores are 0, the first participant (index 0) is the de facto leader.
    let currentLeaderScore = INITIAL_PARTICIPANT_SCORE;
    let currentLeaderIndex = 0;

    // Iterate through each subsequent line, which represents a score update event.
    for (const updateInstruction of processedInputLines) {
        // Skip any empty lines that might have resulted from parsing.
        if (!updateInstruction.trim()) {
            continue;
        }

        const [participantIdOneBased, scoreAdjustment] = updateInstruction.split(' ').map(parseNumericString);

        // Validate the individual update instruction.
        if (participantIdOneBased <= 0 || participantIdOneBased > totalParticipants || isNaN(scoreAdjustment)) {
            console.warn(`[WARNING] Skipping malformed update instruction: "${updateInstruction}".`);
            continue;
        }

        // Convert the 1-based participant ID to a 0-based array index.
        const participantIndexZeroBased = participantIdOneBased - 1;

        // Apply the score modification to the relevant participant.
        participantScores[participantIndexZeroBased] += scoreAdjustment;

        // Determine if a full re-evaluation of the leader board is necessary.
        // A full scan is avoided only if the current leader's score increased or stayed the same.
        const requiresFullReevaluation = (participantIndexZeroBased !== currentLeaderIndex) || (scoreAdjustment < 0);

        if (requiresFullReevaluation) {
            // Recalculate the leader and their score from the updated scores array.
            const { topScore, leaderIdentifier } = ascertainCurrentLeader(participantScores);
            currentLeaderScore = topScore;
            currentLeaderIndex = leaderIdentifier;
        } else {
            // Optimization: If the current leader's score only increased,
            // we can simply add the score adjustment without a full scan.
            currentLeaderScore += scoreAdjustment;
        }

        // Output the identifier (1-based) of the current leader and their score.
        // Using template literals for clear and concise output formatting.
        console.log(`${currentLeaderIndex + 1} ${currentLeaderScore}`);
    }

} catch (runtimeError) {
    // Catch and report any unexpected errors that occur during execution.
    console.error(`[FATAL ERROR] An unhandled exception occurred: ${runtimeError.message}`);
    // Optionally, print the full stack trace for debugging purposes.
    // console.error(runtimeError.stack);
    process.exit(1);
}