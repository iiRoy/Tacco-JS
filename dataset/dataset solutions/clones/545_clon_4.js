const originalContent = require('node:fs').readFileSync('/dev/stdin', 'utf8');
const lineSegments = originalContent.trim().split('\n');

const calculateMatchScores = (alphaPoints, betaPoints) => {
    if (alphaPoints > betaPoints) {
        return { p1Add: alphaPoints + betaPoints, p2Add: 0 };
    } else if (alphaPoints < betaPoints) {
        return { p1Add: 0, p2Add: betaPoints + alphaPoints };
    } else {
        return { p1Add: alphaPoints, p2Add: betaPoints };
    }
};

const processGameRounds = (segmentsToProcess, currentOffset = 0) => {
    if (currentOffset >= segmentsToProcess.length) {
        return [];
    }

    const roundQuantity = Number(segmentsToProcess[currentOffset]);
    if (roundQuantity === 0) {
        return [];
    }

    const currentMatchesData = segmentsToProcess
        .slice(currentOffset + 1, currentOffset + 1 + roundQuantity)
        .map(matchLine => matchLine.split(' ').map(Number));

    const initialTally = { playerAlphaScore: 0, playerBetaScore: 0 };
    const gameResultSummary = currentMatchesData.reduce((accumulator, currentMatchPair) => {
        const [alphaPoints, betaPoints] = currentMatchPair;
        const scoreDeltas = calculateMatchScores(alphaPoints, betaPoints);
        accumulator.playerAlphaScore += scoreDeltas.p1Add;
        accumulator.playerBetaScore += scoreDeltas.p2Add;
        return accumulator;
    }, initialTally);

    const nextOffset = currentOffset + roundQuantity + 1;
    const subsequentGameSummaries = processGameRounds(segmentsToProcess, nextOffset);

    return [gameResultSummary].concat(subsequentGameSummaries);
};

const finalGameSummaries = processGameRounds(lineSegments);

finalGameSummaries.forEach(summaryObject => {
    console.log(`${summaryObject.playerAlphaScore} ${summaryObject.playerBetaScore}`);
});