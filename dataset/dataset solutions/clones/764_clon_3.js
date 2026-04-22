const fileSystem = require('fs');

// Reads the entire input from standard input, decodes it as UTF-8.
// This `rawInputBuffer` contains all election data, including round terminators and votes.
const rawInputBuffer = fileSystem.readFileSync('/dev/stdin', 'utf8');

// Pre-processes the raw input: removes any leading/trailing whitespace and splits the content
// into an array of individual lines. Each line corresponds to either a round header (which is discarded
// by the problem's logic, as the next line is the one with votes) or a list of votes.
let electionProcessLines = rawInputBuffer.trim().split("\n");

// An accumulator string to store the results of each processed election round.
// This will hold the winner and their vote count, or a 'TIE' declaration.
let finalElectionResultsLog = "";

// Main loop to process election rounds.
// It continues as long as `electionProcessLines` is not empty and the first element (shifted off)
// does not parse to the integer 0. The `parseInt` ensures numeric comparison.
while (parseInt(electionProcessLines.shift(), 10) !== 0) {
    // Extracts the actual line containing space-separated candidate identifiers for the current round.
    const currentRoundBallots = electionProcessLines.shift().split(" ");
    
    // Initializes a `Map` to efficiently store and retrieve vote counts for each candidate
    // in the current election round. Using a Map provides better performance for key-value
    // operations compared to a plain object when keys can be arbitrary strings.
    const candidateVoteTallies = new Map();

    // A counter to keep track of how many ballots have been processed in the current round.
    // This variable's final value will indicate if a winner was found early or if it resulted in a tie.
    let processedBallotCount;

    // Iterates through each individual ballot cast in the current round.
    // `processedBallotCount` serves as the 0-indexed position of the ballot currently being examined.
    for (processedBallotCount = 0; processedBallotCount < currentRoundBallots.length; processedBallotCount++) {
        const currentVotedCandidate = currentRoundBallots[processedBallotCount];

        // Updates the vote count for the `currentVotedCandidate`.
        // If the candidate is encountered for the first time, their count starts at 0 before incrementing.
        const previousVoteCount = candidateVoteTallies.get(currentVotedCandidate) || 0;
        candidateVoteTallies.set(currentVotedCandidate, previousVoteCount + 1);

        // Converts the `candidateVoteTallies` Map into an array of `[voteCount, candidateIdentifier]` pairs.
        // This transformation is necessary to allow for sorting based on vote counts.
        let rankedCandidatesList = Array.from(candidateVoteTallies.entries()).map(([id, count]) => [count, id]);

        // Sorts the `rankedCandidatesList` in descending order based on vote counts.
        // The candidate with the highest number of votes will always be at index 0.
        rankedCandidatesList.sort((firstEntry, secondEntry) => secondEntry[0] - firstEntry[0]);

        // Retrieves the vote count of the current leading candidate.
        const topCandidateScore = rankedCandidatesList[0][0];
        
        // Determines the vote count of the second-place candidate.
        // If there's only one unique candidate (or fewer) identified so far, the second-place score is considered 0.
        const secondPlaceScore = (rankedCandidatesList.length > 1) ? rankedCandidatesList[1][0] : 0;

        // Calculates the number of ballots that have not yet been processed in this round.
        const remainingBallotsToCount = currentRoundBallots.length - (processedBallotCount + 1);

        // Implements the early winner check:
        // If the leading candidate's score is strictly greater than the sum of the second-place candidate's score
        // and all `remainingBallotsToCount`, then the leading candidate has secured an undeniable victory.
        if (topCandidateScore > (secondPlaceScore + remainingBallotsToCount)) {
            const confirmedWinnerIdentifier = rankedCandidatesList[0][1];
            const ballotsProcessedForVictory = processedBallotCount + 1; // Convert to 1-indexed count for output.

            // Appends the winner's identifier and the number of ballots processed at the time of victory
            // to the `finalElectionResultsLog`.
            finalElectionResultsLog += `${confirmedWinnerIdentifier} ${ballotsProcessedForVictory}\n`;
            break; // Exits the inner loop as a winner has been determined for this round.
        }
    }

    // After the inner loop completes, this condition checks if the loop finished naturally
    // (i.e., `processedBallotCount` reached the total number of ballots) without an early winner.
    // If so, it signifies that no candidate could achieve an undeniable lead, resulting in a tie.
    if (processedBallotCount === currentRoundBallots.length) {
        finalElectionResultsLog += `TIE\n`; // Records a tie in the results log.
    }
}

// Outputs the accumulated election results to the console.
// `trim()` is used to remove any trailing newline characters from the final log string.
console.log(finalElectionResultsLog.trim());