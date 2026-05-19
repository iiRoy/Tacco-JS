const fs = require('fs');

const rawInputContent = fs.readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInputContent.trim().split("\n");

const electionRounds = [];
let currentLineIndex = 0;
while (currentLineIndex < inputLines.length) {
    const voteCountLine = inputLines[currentLineIndex++];
    const numberOfVotes = parseInt(voteCountLine, 10);

    if (numberOfVotes === 0) {
        break;
    }

    const votesString = inputLines[currentLineIndex++];
    const individualVotes = votesString.split(" ");
    electionRounds.push(individualVotes);
}

const electionOutcomes = electionRounds.map(currentRoundVotes => {
    const roundState = currentRoundVotes.reduce((accumulator, currentCandidateVote, votePosition) => {
        if (accumulator.hasWinner) {
            return accumulator;
        }

        accumulator.candidateTallies.set(
            currentCandidateVote,
            (accumulator.candidateTallies.get(currentCandidateVote) || 0) + 1
        );

        let highestScore = 0;
        let secondHighestScore = 0;
        let currentFrontRunner = null;

        for (const [candidateName, score] of accumulator.candidateTallies.entries()) {
            if (score > highestScore) {
                secondHighestScore = highestScore;
                highestScore = score;
                currentFrontRunner = candidateName;
            } else if (score > secondHighestScore) {
                secondHighestScore = score;
            }
        }

        const remainingBallotsToProcess = currentRoundVotes.length - (votePosition + 1);

        if (highestScore > secondHighestScore + remainingBallotsToProcess) {
            accumulator.hasWinner = true;
            accumulator.resultString = `${currentFrontRunner} ${votePosition + 1}`;
        }

        return accumulator;
    }, {
        candidateTallies: new Map(),
        hasWinner: false,
        resultString: "TIE"
    });

    return roundState.resultString;
});

console.log(electionOutcomes.join("\n"));
