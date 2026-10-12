const fileSystem = require('fs');
const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');

function* parseGameData(allInputLines) {
    let currentLineIndex = 0;
    while (true) {
        const configLine = allInputLines[currentLineIndex++];
        const [playerCount, teamCount] = configLine.split(" ").map(Number);

        if (playerCount === 0 && teamCount === 0) {
            break;
        }

        const roundScores = [];
        for (let i = 0; i < playerCount; i++) {
            roundScores.push(allInputLines[currentLineIndex++].split(" ").map(Number));
        }
        yield { playerCount, teamCount, roundScores };
    }
}

const inputLinesArray = rawInputContent.trim().split("\n");

for (const gameSession of parseGameData(inputLinesArray)) {
    const { playerCount: currentPlayers, teamCount: currentTeams, roundScores: sessionScores } = gameSession;

    // Initialize team scores using a Map, then accumulate scores using reduce
    const teamScoreMap = sessionScores.reduce((accumulatorMap, roundPoints) => {
        roundPoints.forEach((pointValue, teamIdx) => {
            const teamIdentifier = teamIdx + 1;
            accumulatorMap.set(teamIdentifier, accumulatorMap.get(teamIdentifier) + pointValue);
        });
        return accumulatorMap;
    }, new Map(Array.from({ length: currentTeams }, (_, i) => [i + 1, 0])));

    // Transform Map entries into an array of objects for sorting
    const rankedTeams = Array.from(teamScoreMap, ([teamId, totalScore]) => ({
        identifier: teamId,
        score: totalScore
    }));

    // Sort the array of objects based on score (descending) and then identifier (ascending)
    rankedTeams.sort((teamA, teamB) => {
        if (teamA.score === teamB.score) {
            return teamA.identifier - teamB.identifier;
        }
        return teamB.score - teamA.score;
    });

    // Extract identifiers from the sorted objects and format output
    const finalOrder = rankedTeams.map(teamObj => teamObj.identifier);
    console.log(finalOrder.join(" "));
}
