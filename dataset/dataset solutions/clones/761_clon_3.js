const fileSystemModule = require('fs');

// Configuration constants for input and output operations.
const STANDARD_INPUT_FILE_PATH = '/dev/stdin';
const LINE_BREAK_CHARACTER = '\n';
const VOTE_ITEM_SEPARATOR = ' ';
const RESULT_MESSAGE_TIE = 'TIE';
const NUMERIC_ZERO = 0; // Represents a zero value for numerical operations and comparisons.

/**
 * Obtains the raw content from the designated standard input file.
 * @returns {string} The complete string content read from stdin.
 */
function obtainFullStandardInputContent() {
    // Read the file synchronously to ensure all input is available before processing.
    return fileSystemModule.readFileSync(STANDARD_INPUT_FILE_PATH, 'utf8');
}

/**
 * Prepares the raw input string by splitting it into an array of individual lines.
 * Each line is also trimmed to remove any leading or trailing whitespace.
 * @param {string} rawInputString - The unprocessed string content from standard input.
 * @returns {string[]} An array of strings, where each string is a trimmed line from the input.
 */
function prepareInputLineSegments(rawInputString) {
    // First, remove any overall whitespace at the start/end of the entire input, then split by newline.
    return rawInputString.trim().split(LINE_BREAK_CHARACTER);
}

/**
 * Attempts to convert a given value into a number. If the conversion results in NaN,
 * it safely defaults to returning NUMERIC_ZERO, preventing errors in arithmetic operations.
 * @param {string | any} valueToConvert - The value that needs to be converted into a number.
 * @returns {number} The numeric representation of the input, or NUMERIC_ZERO if not a valid number.
 */
function ensureNumericValue(valueToConvert) {
    const parsedNumber = Number(valueToConvert);
    // Use isNaN to check for invalid number conversions.
    return isNaN(parsedNumber) ? NUMERIC_ZERO : parsedNumber;
}

/**
 * Transforms a Map of candidate tallies into a sorted array of objects.
 * Each object contains the candidate's identifier and their vote count.
 * The array is sorted in descending order based on vote counts.
 * @param {Map<string, number>} currentCandidateTallies - A Map where keys are candidate identifiers and values are their respective vote counts.
 * @returns {{candidateId: string, voteCount: number}[]} An array of candidate objects, sorted by vote count (highest first).
 */
function orderCandidatesByScore(currentCandidateTallies) {
    // Convert the Map entries into an intermediate array of objects.
    const candidateScoreList = Array.from(currentCandidateTallies.entries()).map(([identifier, count]) => ({
        candidateId: identifier,
        voteCount: count
    }));

    // Sort the list using a comparison function that orders by voteCount in descending order.
    candidateScoreList.sort((candidateA, candidateB) => candidateB.voteCount - candidateA.voteCount);

    return candidateScoreList;
}

// --- Main Program Execution Flow ---

// Step 1: Read all input data once at the beginning.
const fullInputContent = obtainFullStandardInputContent();
// Step 2: Process the raw input into an array of lines for sequential access.
const inputLineBuffer = prepareInputLineSegments(fullInputContent);

// Main processing loop: continues as long as there are rounds of voting data to process.
// A round count of NUMERIC_ZERO signals the end of input.
while (true) {
    // Attempt to extract the line specifying the number of items (votes) for the current round.
    const roundVoteCountLine = inputLineBuffer.shift();

    // Guard clause: If no more lines are available, it implies the end of input or malformed data.
    if (roundVoteCountLine === undefined) {
        break;
    }

    // Convert the extracted line to a number.
    const currentRoundTotalVotes = ensureNumericValue(roundVoteCountLine);

    // Termination condition: If the round count is zero, exit the main processing loop.
    if (currentRoundTotalVotes === NUMERIC_ZERO) {
        break;
    }

    // Extract the line containing the individual vote items for this round.
    const voteItemsRawLine = inputLineBuffer.shift();

    // Another guard clause: Ensure there's a line for vote items corresponding to the round count.
    if (voteItemsRawLine === undefined) {
        console.error("Error: Expected a line with vote items but input buffer is empty. Terminating processing.");
        break;
    }

    // Split the vote items line into an array of individual vote strings.
    const individualVoteItems = voteItemsRawLine.split(VOTE_ITEM_SEPARATOR);

    // Initialize a Map to store and manage tallies for each unique candidate in the current round.
    const currentRoundTallies = new Map();
    // A boolean flag to track if a clear winner has been identified early in this round.
    let winnerDeclaredEarly = false;

    // Iterate through each vote item in the current round to update tallies and check for an early winner.
    for (let voteProcessingIndex = NUMERIC_ZERO; voteProcessingIndex < currentRoundTotalVotes; voteProcessingIndex++) {
        const itemCurrentlyVotedFor = individualVoteItems[voteProcessingIndex];

        // Increment the vote count for the current item. If the item is new, initialize its count to 1.
        currentRoundTallies.set(itemCurrentlyVotedFor, (currentRoundTallies.get(itemCurrentlyVotedFor) || NUMERIC_ZERO) + 1);

        // Calculate the number of votes that are still pending processing in this round.
        const votesRemainingToProcess = currentRoundTotalVotes - (voteProcessingIndex + 1);

        // Get an array of candidates sorted by their current vote counts (highest first).
        const sortedCandidateResults = orderCandidatesByScore(currentRoundTallies);

        // If there are no candidates tallied yet (e.g., first iteration with no valid item), skip checks.
        if (sortedCandidateResults.length === NUMERIC_ZERO) {
            continue;
        }

        const leadingCandidateResult = sortedCandidateResults[NUMERIC_ZERO];
        // Determine the vote count of the second-place candidate.
        // If there's only one unique candidate, the "second place" count is effectively zero.
        const secondPlaceVoteCount = sortedCandidateResults.length > 1 ?
            sortedCandidateResults[1].voteCount :
            NUMERIC_ZERO;

        // If the top two candidates have the same number of votes, an early winner cannot be determined yet.
        if (leadingCandidateResult.voteCount === secondPlaceVoteCount) {
            continue;
        }

        // Check for an insurmountable lead: if the leading candidate's votes
        // exceed the second-place candidate's votes plus all remaining possible votes.
        if (leadingCandidateResult.voteCount > secondPlaceVoteCount + votesRemainingToProcess) {
            // An early winner is identified! Output their ID and the turn number (1-indexed).
            console.log(leadingCandidateResult.candidateId, voteProcessingIndex + 1);
            winnerDeclaredEarly = true; // Set flag to true.
            break; // Exit the inner loop, as the winner is found.
        }
    }

    // If the inner loop completed without an early winner declaration, the round results in a TIE.
    if (!winnerDeclaredEarly) {
        console.log(RESULT_MESSAGE_TIE);
    }
}