const fileSystem = require('fs');
const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');

const inputSegments = rawInputContent.trim().split("\n");
const [totalPlayers, totalQueries] = inputSegments.shift().split(" ").map(Number);

const playerPerformance = Array.from({ length: totalPlayers }, () => 0);

const determineCurrentTopPerformer = (performanceRecords) => {
    return performanceRecords.reduce((bestResult, currentScore, currentIndex) => {
        if (currentScore > bestResult.score) {
            return { score: currentScore, index: currentIndex };
        } else if (currentScore === bestResult.score && currentIndex < bestResult.index) {
            return { score: currentScore, index: currentIndex };
        }
        return bestResult;
    }, { score: -Infinity, index: -1 });
};

let topPerformer = determineCurrentTopPerformer(playerPerformance);

inputSegments.forEach((queryEntry) => {
    const [targetPlayerIdOneBased, scoreAdjustment] = queryEntry.split(" ").map(Number);
    const targetPlayerIdZeroBased = targetPlayerIdOneBased - 1;

    playerPerformance[targetPlayerIdZeroBased] += scoreAdjustment;

    topPerformer = determineCurrentTopPerformer(playerPerformance);

    console.log(`${topPerformer.index + 1} ${topPerformer.score}`);
});
