const fileSystem = require('fs');
const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');
let processedInputLines = rawInputData.trim().split("\n");
let finalOutputString = "";

// Helper function to generate a sorted list of vote counts and candidate identifiers
const generateSortedVoteList = (candidateVoteMap) => {
    const voteEntries = Object.entries(candidateVoteMap);
    const formattedVoteData = voteEntries.map(([candidateKey, voteCountValue]) => [voteCountValue, candidateKey]);
    formattedVoteData.sort((entryA, entryB) => entryB[0] - entryA[0]); // Sort in descending order of votes
    return formattedVoteData;
};

while (true) {
    const currentLineForCount = processedInputLines.shift();
    const totalCandidatesForRound = parseInt(currentLineForCount, 10);

    if (totalCandidatesForRound === 0) {
        break; // Exit loop if the sentinel value is encountered
    }

    const currentRoundVotes = processedInputLines.shift().split(" ");
    const candidateTallies = {};
    let earlyWinnerDetermined = false;

    for (let votePosition = 0; votePosition < currentRoundVotes.length; votePosition++) {
        const currentVotedCandidate = currentRoundVotes[votePosition];
        
        // Increment vote count for the current candidate
        candidateTallies[currentVotedCandidate] = (candidateTallies[currentVotedCandidate] || 0) + 1;

        const currentSortedVoteResults = generateSortedVoteList(candidateTallies);

        const leadingCandidateVotes = currentSortedVoteResults[0][0];
        const runnerUpVotes = (currentSortedVoteResults.length > 1) ? currentSortedVoteResults[1][0] : 0; // If only one candidate, runner-up has 0 votes

        const remainingVotesPossible = currentRoundVotes.length - (votePosition + 1);
        const requiredLeadToWin = runnerUpVotes + remainingVotesPossible;

        // Check if the leading candidate has an insurmountable lead
        if (leadingCandidateVotes > requiredLeadToWin) {
            const winningCandidateIdentifier = currentSortedVoteResults[0][1];
            const votesProcessedUntilWin = votePosition + 1;
            finalOutputString += winningCandidateIdentifier + " " + votesProcessedUntilWin + "\n";
            earlyWinnerDetermined = true;
            break; // A winner was found, move to the next round
        }
    }

    // If the loop completed without an early winner, it's a TIE
    if (!earlyWinnerDetermined) {
        finalOutputString += "TIE" + "\n";
    }
}

console.log(finalOutputString.trim());
