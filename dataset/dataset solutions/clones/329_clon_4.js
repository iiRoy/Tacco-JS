const displayResult = console.log;

function* generateEvents(corpus) {
    const lines = corpus.split('\n');
    for (const line of lines) {
        yield line;
    }
}

function runSingleMatch(eventIterator, currentEliminations, currentBaseOccupants, currentTally) {
    if (currentEliminations >= 3) {
        return currentTally;
    }

    const { value: currentAction, done } = eventIterator.next();
    if (done) {
        throw new Error("Unexpected end of event stream during match.");
    }

    const eventHandlers = {
        'HIT': (elim, bases, score) => {
            let nextBases = bases + 1;
            let nextScore = score;
            if (nextBases === 4) {
                nextScore++;
                nextBases--;
            }
            return { elim: elim, bases: nextBases, score: nextScore };
        },
        'HOMERUN': (elim, bases, score) => {
            return { elim: elim, bases: 0, score: score + bases + 1 };
        },
        'OUT': (elim, bases, score) => {
            return { elim: elim + 1, bases: bases, score: score };
        }
    };

    const handler = eventHandlers[currentAction];
    if (!handler) {
        throw new Error("Unknown game event: " + currentAction);
    }
    const newState = handler(currentEliminations, currentBaseOccupants, currentTally);
    return runSingleMatch(eventIterator, newState.elim, newState.bases, newState.score);
}

function overseeChampionship(eventGenerator, gamesRemaining) {
    if (gamesRemaining <= 0) {
        return;
    }

    const finalScore = runSingleMatch(eventGenerator, 0, 0, 0);
    displayResult(finalScore);

    overseeChampionship(eventGenerator, gamesRemaining - 1);
}

function ProcessChampionship(incomingData) {
    const eventGeneratorInstance = generateEvents(incomingData);
    const { value: numContestsStr, done: N_done } = eventGeneratorInstance.next();
    if (N_done) {
        throw new Error("Input data empty.");
    }
    const numContests = parseInt(numContestsStr);

    overseeChampionship(eventGeneratorInstance, numContests);
}

ProcessChampionship(require("fs").readFileSync("/dev/stdin", "utf8"));