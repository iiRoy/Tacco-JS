var logOutput = console.log;

function* createInputReader(rawText) {
    const lines = rawText.split("\n");
    for (const line of lines) {
        yield line;
    }
}

const handleEvent = {
    'HIT': (currentState) => {
        let newRunners = currentState.runners + 1;
        let newScore = currentState.score;
        if (newRunners === 4) {
            newScore++;
            newRunners = 3;
        }
        return { ...currentState, runners: newRunners, score: newScore };
    },
    'HOMERUN': (currentState) => {
        return {
            ...currentState,
            score: currentState.score + currentState.runners + 1,
            runners: 0
        };
    },
    'OUT': (currentState) => {
        return { ...currentState, outs: currentState.outs + 1 };
    }
};

function simulateInning(inputGenerator, currentGameState) {
    if (currentGameState.outs === 3) {
        return currentGameState.score;
    }

    const eventType = inputGenerator.next().value;
    const eventHandler = handleEvent[eventType] || handleEvent['OUT'];
    const nextGameState = eventHandler(currentGameState);

    return simulateInning(inputGenerator, nextGameState);
}

function mainProcessor(rawInput) {
    const inputGen = createInputReader(rawInput);
    const numberOfGames = parseInt(inputGen.next().value, 10);

    Array.from({ length: numberOfGames }).forEach(() => {
        const initialGameState = { outs: 0, runners: 0, score: 0 };
        const finalScore = simulateInning(inputGen, initialGameState);
        logOutput(finalScore);
    });
}

mainProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));
