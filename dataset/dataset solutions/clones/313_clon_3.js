const filesystemModule = require('fs');

// Define programmatic constants for enhanced readability and maintainability
const STANDARD_INPUT_FILE_PATH = '/dev/stdin';
const LINE_BREAK_CHARACTER = '\n';
const DATA_VALUE_SEPARATOR = ' ';
const ONE_BASED_INDEX_ADJUSTMENT = 1; // Constant for converting between 0-based and 1-based indexing

/**
 * Helper function to safely parse an array of string numbers into actual Number types.
 * @param {string[]} stringArray - An array of strings, each representing a number.
 * @returns {number[]} An array of numbers.
 */
const convertStringsToNumbers = (stringArray) => stringArray.map(Number);

// Read all raw content from the standard input stream, ensuring UTF-8 encoding
const entireInputContentBuffer = filesystemModule.readFileSync(STANDARD_INPUT_FILE_PATH, 'utf8');

// Normalize input: remove any leading/trailing whitespace from the entire content
// and then split it into an array of individual lines.
let inputLinesArray = entireInputContentBuffer.trim().split(LINE_BREAK_CHARACTER);

// Extract the initial configuration parameters from the very first line of input.
// The .shift() method removes this line from the array and returns it.
const configurationLine = inputLinesArray.shift();

// Parse the configuration line to get the total number of participants (N)
// and the total number of update queries (Q).
const [totalParticipantsCount, totalUpdateQueries] = convertStringsToNumbers(configurationLine.split(DATA_VALUE_SEPARATOR));

// Initialize an array to hold the current scores for each participant.
// All participants begin with a score of zero. The array size is determined by N.
let currentParticipantScores = new Array(totalParticipantsCount).fill(0);

// Variables to keep track of the highest score currently recorded
// and the 0-based index of the participant who holds that score.
// Initialized assuming all scores start at zero, so participant 0 is initially the leader.
let currentHighestScoreValue = 0;
let currentLeaderParticipantIndex = 0; // This is a 0-based index

/**
 * A dedicated utility function to scan through all participant scores
 * and identify the participant with the highest score and their score value.
 * This centralizes the leaderboard re-evaluation logic.
 * @param {number[]} scoresCollection - The array of all participant scores.
 * @returns {{score: number, index: number}} An object containing the highest score found
 *                                          and the 0-based index of the participant with that score.
 */
const determineLeaderboardStatus = (scoresCollection) => {
    let temporaryMaxScore = Number.MIN_SAFE_INTEGER; // Initialize with the smallest possible safe integer
    let temporaryLeaderIndex = -1; // Initialize with an invalid index

    // Iterate through each score entry to find the maximum value and its position
    scoresCollection.forEach((individualScore, participantPosIndex) => {
        if (individualScore > temporaryMaxScore) {
            temporaryMaxScore = individualScore;
            temporaryLeaderIndex = participantPosIndex;
        }
    });

    // Return the findings in a structured object
    return {
        score: temporaryMaxScore,
        index: temporaryLeaderIndex
    };
};

// Process each remaining line in the input array as an individual score update query.
// The totalUpdateQueries variable is available but not directly used to control the loop,
// as forEach naturally iterates over all available query lines.
inputLinesArray.forEach((queryInformationString) => {
    // Parse the current query line: it contains the target participant's ID (1-based)
    // and the score adjustment value.
    const [targetParticipantID_OneBased, scoreAdjustmentAmount] = convertStringsToNumbers(queryInformationString.split(DATA_VALUE_SEPARATOR));

    // Convert the 1-based participant ID to a 0-based array index for internal use.
    const targetParticipantArrayActualIndex = targetParticipantID_OneBased - ONE_BASED_INDEX_ADJUSTMENT;

    // Apply the score adjustment to the participant's total score.
    currentParticipantScores[targetParticipantArrayActualIndex] += scoreAdjustmentAmount;

    // Logic to determine if a full re-scan of the leaderboard is necessary.
    // This is a rewritten section of the original logic (Type III change).
    // The original code had specific optimizations to avoid re-scanning.
    // This modified logic simplifies the conditions for a full scan.

    const isTargetParticipantCurrentLeader = (targetParticipantArrayActualIndex === currentLeaderParticipantIndex);
    const hasLeaderScoreIncreased = (isTargetParticipantCurrentLeader && scoreAdjustmentAmount >= 0);

    if (hasLeaderScoreIncreased) {
        // Optimization: If the current leader's score has simply increased (or stayed same with 0 adjustment),
        // they definitely remain the leader. We only need to update their score value.
        currentHighestScoreValue += scoreAdjustmentAmount;
    } else {
        // In all other scenarios (e.g., leader's score decreased, or a non-leader's score changed
        // positively or negatively), we perform a full scan of all participant scores.
        // This ensures correctness by re-evaluating the entire leaderboard to find the new leader.
        const { score: newHighestScore, index: newLeaderIndex } = determineLeaderboardStatus(currentParticipantScores);
        currentHighestScoreValue = newHighestScore;
        currentLeaderParticipantIndex = newLeaderIndex;
    }

    // Output the current leader's ID (converted back to 1-based) and their current highest score.
    // Using a template literal for clear and concise string construction.
    console.log(`${currentLeaderParticipantIndex + ONE_BASED_INDEX_ADJUSTMENT} ${currentHighestScoreValue}`);
});