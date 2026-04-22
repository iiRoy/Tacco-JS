const sourceReader = require('node:fs').readFileSync('/dev/stdin', 'utf8');
const allInputLines = sourceReader.trim().split('\n');

function* electionCaseGenerator(lineRegistry) {
    let currentLineIndex = 0;
    while (currentLineIndex < lineRegistry.length) {
        const caseIdentifier = lineRegistry[currentLineIndex++];
        if (caseIdentifier === '0') {
            return;
        }
        if (currentLineIndex < lineRegistry.length) {
            const voteSequence = lineRegistry[currentLineIndex++];
            yield voteSequence.split(' ');
        } else {
            // Should not happen if '0' is always the final line
            return;
        }
    }
}

function resolveElectionOutcome(pendingVotes, currentVoteCounts, ballotsProcessedSoFar) {
    if (pendingVotes.length === 0) {
        return "TIE";
    }

    const currentBallot = pendingVotes[0];
    const updatedVoteCounts = new Map(currentVoteCounts);
    updatedVoteCounts.set(currentBallot, (updatedVoteCounts.get(currentBallot) || 0) + 1);

    const totalBallotsCast = ballotsProcessedSoFar + 1;
    const votesRemaining = pendingVotes.length - 1;

    const rankedCandidates = Array.from(updatedVoteCounts.entries())
                                   .sort((c1, c2) => c2[1] - c1[1]);

    const topContender = rankedCandidates[0];
    const secondContender = rankedCandidates[1] || [null, 0]; // Handles single candidate scenario

    if (topContender && topContender[1] > secondContender[1] + votesRemaining) {
        return `${topContender[0]} ${totalBallotsCast}`;
    }

    return resolveElectionOutcome(
        pendingVotes.slice(1),
        updatedVoteCounts,
        totalBallotsCast
    );
}

const collectedResults = [];
for (const currentElectionVotes of electionCaseGenerator(allInputLines)) {
    collectedResults.push(resolveElectionOutcome(currentElectionVotes, new Map(), 0));
}

console.log(collectedResults.join('\n').trim());