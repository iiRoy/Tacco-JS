const obtainRawData = () => require('node:fs').readFileSync(0, 'utf8');

const parseNumericalSequence = (lineContent) => lineContent.split(' ').map(Number);

const establishRankingCriteria = (entryA, entryB) => {
    const scoreA = entryA[1];
    const scoreB = entryB[1];
    const identifierA = entryA[0];
    const identifierB = entryB[0];

    if (scoreA === scoreB) {
        return identifierA - identifierB;
    } else {
        return scoreB - scoreA;
    }
};

const processGameRounds = (dataLines, currentLineCursor) => {
    const configurationLine = dataLines[currentLineCursor];
    if (!configurationLine) return;

    const [playerCount, gameCount] = parseNumericalSequence(configurationLine);

    if (playerCount === 0 && gameCount === 0) {
        return;
    }

    const gameAccumulators = new Map();
    for (let gameIdentifier = 1; gameIdentifier <= gameCount; ++gameIdentifier) {
        gameAccumulators.set(gameIdentifier, 0);
    }

    for (let playerIndex = 0; playerIndex < playerCount; ++playerIndex) {
        const playerScoresLine = dataLines[currentLineCursor + 1 + playerIndex];
        const individualScores = parseNumericalSequence(playerScoresLine);

        individualScores.forEach((scoreComponent, gameIdx) => {
            const currentGameId = gameIdx + 1;
            gameAccumulators.set(currentGameId, gameAccumulators.get(currentGameId) + scoreComponent);
        });
    }

    const rawGameEntries = Array.from(gameAccumulators.entries());

    rawGameEntries.sort(establishRankingCriteria);

    const orderedGameIdentifiers = rawGameEntries.map(entry => entry[0]);

    console.log(orderedGameIdentifiers.join(' '));

    const nextCursorPosition = currentLineCursor + 1 + playerCount + 1;
    processGameRounds(dataLines, nextCursorPosition);
};

const fullInputText = obtainRawData();
const inputSegmentArray = fullInputText.trim().split('\n');

processGameRounds(inputSegmentArray, 0);