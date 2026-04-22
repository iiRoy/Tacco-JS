const fileSystemModule = require('fs'); // Import the Node.js file system module.

// Define constants for input and output operations.
const STANDARD_INPUT_PATH = '/dev/stdin';
const UTF8_ENCODING = 'utf8';
const TIE_MESSAGE = "TIE";
const EXIT_SENTINEL = '0'; // The value indicating the end of input blocks.

/**
 * Reads and processes voting data from standard input.
 * Each block of input consists of a line with the number of votes (N),
 * followed by a line with N space-separated vote entries.
 * The process continues until a block size of '0' is encountered.
 * For each block, it determines if a candidate achieves an early majority.
 */
function processVotingRounds() {
    // Read all raw input data from the specified path, using UTF-8 encoding.
    const rawInputContent = fileSystemModule.readFileSync(STANDARD_INPUT_PATH, { encoding: UTF8_ENCODING });

    // Prepare the input: trim leading/trailing whitespace and split into an array of lines.
    let inputLinesBuffer = rawInputContent.trim().split('\n');

    // Main loop: processes each voting round until the exit sentinel is found or no more lines.
    while (inputLinesBuffer.length > 0) {
        // Attempt to extract the current round's vote count indicator.
        const currentRoundSizeStr = inputLinesBuffer.shift();

        // Check for undefined or the exit sentinel '0'.
        if (currentRoundSizeStr === undefined || currentRoundSizeStr.trim() === EXIT_SENTINEL) {
            break; // Exit the processing loop.
        }

        // Parse the block size. Add a guard for invalid numerical input.
        const currentRoundExpectedSize = parseInt(currentRoundSizeStr.trim(), 10);
        if (isNaN(currentRoundExpectedSize) || currentRoundExpectedSize < 0) {
            // Log an error and attempt to skip the corresponding data line to continue.
            console.error(`Warning: Invalid block size encountered '${currentRoundSizeStr}'. Skipping this round.`);
            if (inputLinesBuffer.length > 0) {
                inputLinesBuffer.shift(); // Consume the data line for the invalid block.
            }
            continue; // Move to the next block.
        }

        // Ensure there are enough lines left for the vote entries.
        if (inputLinesBuffer.length === 0) {
            console.error("Error: Unexpected end of input after block size declaration. Exiting.");
            break;
        }

        // Get the vote entries for the current round and filter out any empty strings from splitting.
        const voteTokensForRound = inputLinesBuffer.shift().split(' ').filter(token => token.length > 0);

        // Initialize a flag to track if a clear winner has been identified in this round.
        let winnerDeclaredThisRound = false;

        // Use a Map to store candidate vote counts for efficient tracking.
        const candidateVoteMap = new Map();

        // Iterate through each vote token to update counts and check for an early majority.
        for (let currentVoteIndex = 0; currentVoteIndex < voteTokensForRound.length; ++currentVoteIndex) {
            const currentVotedCandidate = voteTokensForRound[currentVoteIndex];

            // Increment the vote count for the current candidate.
            // If the candidate is new, initialize their count to 0 before incrementing.
            const existingCandidateCount = candidateVoteMap.get(currentVotedCandidate) || 0;
            candidateVoteMap.set(currentVotedCandidate, existingCandidateCount + 1);

            // Convert map entries to an array of [count, candidate] for sorting and analysis.
            const voteScoresArray = Array.from(candidateVoteMap.entries()).map(([candidateId, countVal]) => [countVal, candidateId]);

            // Sort the candidates by their vote counts in descending order (highest count first).
            voteScoresArray.sort((scoreEntryA, scoreEntryB) => scoreEntryB[0] - scoreEntryA[0]);

            // Extract the score of the leading candidate.
            const leadingCandidateScore = voteScoresArray[0][0];

            // Determine the score of the second-place candidate.
            // If there's only one unique candidate, the runner-up score is effectively zero.
            const runnerUpCandidateScore = voteScoresArray.length > 1 ? voteScoresArray[1][0] : 0;

            // Calculate the number of votes yet to be processed in this round.
            const remainingVotesToProcess = voteTokensForRound.length - (currentVoteIndex + 1);

            // Check for an insurmountable lead:
            // If the leader's score is greater than the runner-up's score plus all remaining votes,
            // the leader cannot be overtaken.
            if (leadingCandidateScore > (runnerUpCandidateScore + remainingVotesToProcess)) {
                // A clear victor has emerged. Log their identifier and the vote count when they secured the win.
                console.log(voteScoresArray[0][1], currentVoteIndex + 1);
                winnerDeclaredThisRound = true; // Set the flag.
                break; // Exit the inner loop, as the winner is determined.
            }
        }

        // If the loop completes without a clear winner, it's a tie.
        if (!winnerDeclaredThisRound) {
            console.log(TIE_MESSAGE);
        }
    }
}

// Execute the main function to start processing.
processVotingRounds();