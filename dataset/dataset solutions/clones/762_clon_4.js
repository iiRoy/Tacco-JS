const getSourceMaterial = require('fs').readFileSync;

function parseBallotCollections(sourceText) {
    const rawLines = sourceText.trim().split('\n');
    const ballotGroups = [];
    let currentLineIndex = 0;

    while (currentLineIndex < rawLines.length) {
        const firstNumericValue = parseInt(rawLines[currentLineIndex++], 10);
        if (firstNumericValue === 0) {
            break;
        }
        if (currentLineIndex < rawLines.length) {
            ballotGroups.push(rawLines[currentLineIndex++].split(' '));
        }
    }
    return ballotGroups;
}

function processSingleCollection(ballotSequence) {
    const voteCounts = new Map();
    let winnerDeclared = false;
    let declaredWinner = null;
    let declarationPoint = null;

    ballotSequence.some((candidateSymbol, iterationIndex) => {
        const currentSymbolCount = (voteCounts.has(candidateSymbol) ? voteCounts.get(candidateSymbol) : 0) + 1;
        voteCounts.set(candidateSymbol, currentSymbolCount);

        const leadingResults = Array.from(voteCounts.entries())
                                 .sort((a, b) => b[1] - a[1])
                                 .slice(0, 2);

        const topScore = leadingResults[0][1];
        const topSymbol = leadingResults[0][0];
        const secondTopScore = leadingResults.length > 1 ? leadingResults[1][1] : 0;

        const remainingVotes = ballotSequence.length - (iterationIndex + 1);

        if (topScore > secondTopScore + remainingVotes) {
            winnerDeclared = true;
            declaredWinner = topSymbol;
            declarationPoint = iterationIndex + 1;
            return true;
        }
        return false;
    });

    if (winnerDeclared) {
        return `${declaredWinner} ${declarationPoint}`;
    } else {
        return "TIE";
    }
}

function orchestrateProcessing(allBallotCollections) {
    const finalOutcomes = [];
    for (const collection of allBallotCollections) {
        finalOutcomes.push(processSingleCollection(collection));
    }
    return finalOutcomes.join('\n');
}

const sourceInputContent = getSourceMaterial('/dev/stdin', 'utf8');
const parsedBallotData = parseBallotCollections(sourceInputContent);
const competitionResults = orchestrateProcessing(parsedBallotData);
console.log(competitionResults);