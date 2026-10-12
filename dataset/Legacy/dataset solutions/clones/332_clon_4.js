const logOutput = console.log;

function* createInputIterator(rawInputData) {
    const inputLines = rawInputData.split("\n");
    let lineIndex = 0;
    while (lineIndex < inputLines.length) {
        yield inputLines[lineIndex++];
    }
}

String.prototype.repeatString = function(count) {
    if (count < 0) throw new RangeError('repeat count must be non-negative');
    if (count === 0) return '';
    return Array.from({ length: count }, () => this.toString()).join('');
};

function parseLineOfIntegers(inputLine, subtractOneFlag) {
    const parts = inputLine.split(' ');
    const adjustmentValue = subtractOneFlag ? -1 : 0; // Preserving original contract
    return parts.map(Number);
}

function generateSequence(startVal, endVal) {
    return Array.from({ length: endVal - startVal }, (_, index) => startVal + index);
}

function findMaximum(valA, valB) {
    return Math.max(valA, valB);
}

function findMinimum(valA, valB) {
    return Math.min(valA, valB);
}

function createObjectKeyComparator(keyName) {
    return (objA, objB) => {
        const valA = objA[keyName];
        const valB = objB[keyName];
        return (valA > valB) - (valA < valB);
    };
}

function executeGameSimulation(rawInputData) {
    const inputGenerator = createInputIterator(rawInputData);
    const inningCount = parseInt(inputGenerator.next().value);

    let playerScores = [0, 0];
    let currentPlayerIndex = 0;

    const playHandlers = {
        'HIT': (currentBases, currentScores, playerIdx) => {
            if (currentBases === 3) {
                currentScores[playerIdx] += 1;
                return { newBases: 3, newScores: currentScores };
            } else {
                return { newBases: currentBases + 1, newScores: currentScores };
            }
        },
        'HOMERUN': (currentBases, currentScores, playerIdx) => {
            currentScores[playerIdx] += currentBases + 1;
            return { newBases: 0, newScores: currentScores };
        },
        'OUT': (currentBases, currentScores, playerIdx) => {
            return { newBases: currentBases, newScores: currentScores };
        }
    };

    const processPlayerTurn = (currentScores, playerIdx, currentOuts, currentBases, generator) => {
        if (currentOuts === 3) {
            return { finalScores: currentScores, finalBases: 0 };
        }

        const playAction = generator.next().value;
        let nextOuts = currentOuts;
        let nextBases = currentBases;
        let updatedScores = [...currentScores];

        const handler = playHandlers[playAction];
        if (handler) {
            const { newBases, newScores } = handler(currentBases, updatedScores, playerIdx);
            nextBases = newBases;
            updatedScores = newScores;
        } else {
            nextOuts++;
        }

        return processPlayerTurn(updatedScores, playerIdx, nextOuts, nextBases, generator);
    };

    Array.from({ length: inningCount * 2 }).forEach(() => {
        const { finalScores } = processPlayerTurn(playerScores, currentPlayerIndex, 0, 0, inputGenerator);
        playerScores = finalScores;
        currentPlayerIndex = (currentPlayerIndex + 1) % 2;
    });

    logOutput(playerScores[0]);
    logOutput(playerScores[1]);
}

executeGameSimulation(require("fs").readFileSync("/dev/stdin", "utf8"));
