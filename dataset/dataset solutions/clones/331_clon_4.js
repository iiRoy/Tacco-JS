const displayResult = console.log;

function* createLineStream(rawData) {
    const seriesLines = rawData.split("\n");
    for (const line of seriesLines) {
        yield line;
    }
}

const playActions = {
    'HIT': ({ currentOuts, baseOccupancy, currentScore }) => {
        let newBaseOccupancy = baseOccupancy + 1;
        let newCurrentScore = currentScore;
        if (newBaseOccupancy === 4) {
            newCurrentScore++;
            newBaseOccupancy = 3;
        }
        return { currentOuts, baseOccupancy: newBaseOccupancy, currentScore: newCurrentScore };
    },
    'HOMERUN': ({ currentOuts, baseOccupancy, currentScore }) => ({
        currentOuts,
        baseOccupancy: 0,
        currentScore: currentScore + baseOccupancy + 1
    }),
    'OUT': ({ currentOuts, baseOccupancy, currentScore }) => ({
        currentOuts: currentOuts + 1,
        baseOccupancy,
        currentScore
    })
};

const evolveGameState = (event, currentState) => {
    const handler = playActions[event];
    return handler ? handler(currentState) : currentState;
};

const simulateGame = (eventStream, gameState) => {
    if (gameState.currentOuts === 3) {
        return gameState.currentScore;
    }
    const nextEvent = eventStream.next().value;
    const newState = evolveGameState(nextEvent, gameState);
    return simulateGame(eventStream, newState);
};

function runTournament(rawSeriesData) {
    const seriesStream = createLineStream(rawSeriesData);
    const matchCount = parseInt(seriesStream.next().value, 10);

    const gameResults = Array.from({ length: matchCount }).map(() => {
        const initialGameState = { currentOuts: 0, baseOccupancy: 0, currentScore: 0 };
        return simulateGame(seriesStream, initialGameState);
    });

    gameResults.forEach(displayResult);
}

runTournament(require("fs").readFileSync("/dev/stdin", "utf8"));