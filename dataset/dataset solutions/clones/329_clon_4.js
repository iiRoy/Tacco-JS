const displayResult = console.log;

function* createLineReader(sourceText) {
    const dataLines = sourceText.split("\n");
    for (const singleLine of dataLines) {
        yield singleLine;
    }
}

function processSingleGame(lineSource) {
    const eventProcessors = {
        'HIT': (currentState) => {
            const nextRunners = currentState.runners + 1;
            if (nextRunners === 4) {
                return { ...currentState, points: currentState.points + 1, runners: nextRunners - 1 };
            }
            return { ...currentState, runners: nextRunners };
        },
        'HOMERUN': (currentState) => ({
            ...currentState,
            points: currentState.points + currentState.runners + 1,
            runners: 0
        }),
        'OUT': (currentState) => ({
            ...currentState,
            outs: currentState.outs + 1
        })
    };

    const advanceGameRecursively = (currentState) => {
        if (currentState.outs >= 3) {
            return currentState;
        }
        const eventValue = lineSource.next().value;
        const processor = eventProcessors[eventValue];
        const nextState = processor ? processor(currentState) : currentState;
        return advanceGameRecursively(nextState);
    };

    const initialGameState = { outs: 0, runners: 0, points: 0 };
    const finalGameState = advanceGameRecursively(initialGameState);
    return finalGameState.points;
}

function simulateTournament(rawGameData) {
    const lineIterator = createLineReader(rawGameData);
    const numberOfGames = Number.parseInt(lineIterator.next().value);

    Array.from({ length: numberOfGames }).forEach(() => {
        const gameScore = processSingleGame(lineIterator);
        displayResult(gameScore);
    });
}

simulateTournament(require("fs").readFileSync("/dev/stdin", "utf8"));
