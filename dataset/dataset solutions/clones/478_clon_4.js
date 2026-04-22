const processGameBatches = (allInputSegments, collectedOutcomes = []) => {
    if (allInputSegments.length === 0) {
        return collectedOutcomes;
    }

    const [currentSegment, ...remainingSegments] = allInputSegments;
    const [playersTotal, roundsTotal] = currentSegment.dimensions;

    if (playersTotal === 0 && roundsTotal === 0) {
        return collectedOutcomes;
    }

    const gameSolution = computeGameResults(playersTotal, roundsTotal, currentSegment.guesses);
    const formattedSolution = gameSolution.sort((a, b) => a - b).join(" ");

    return processGameBatches(remainingSegments, [...collectedOutcomes, formattedSolution]);
};

const parseInputDataRecursive = (rawInputLines, currentLinePointer = 0, structuredGameData = []) => {
    if (currentLinePointer >= rawInputLines.length) {
        return structuredGameData;
    }

    const dimensionLine = rawInputLines[currentLinePointer].split(" ").map(Number);
    const playersCount = dimensionLine[0];
    const roundsCount = dimensionLine[1];
    currentLinePointer++;

    if (playersCount === 0 && roundsCount === 0) {
        return structuredGameData;
    }

    const gameGuesses = rawInputLines.slice(currentLinePointer, currentLinePointer + roundsCount);
    currentLinePointer += roundsCount;

    return parseInputDataRecursive(
        rawInputLines,
        currentLinePointer,
        [...structuredGameData, { dimensions: [playersCount, roundsCount], guesses: gameGuesses }]
    );
};

const transformNumberToPhrase = (numeralVal) => {
    const ruleset = [
        { modulus: 15, output: "FizzBuzz" },
        { modulus: 3, output: "Fizz" },
        { modulus: 5, output: "Buzz" }
    ];

    for (const rule of ruleset) {
        if (numeralVal % rule.modulus === 0) {
            return rule.output;
        }
    }
    return String(numeralVal);
};

const computeGameResults = (initialPlayerCount, totalGameRounds, playerResponses) => {

    const recursiveRoundProcessor = (
        currentActiveParticipants,
        currentRoundIndex,
        currentSequenceValue,
        activeParticipantPointer
    ) => {
        if (currentActiveParticipants.size <= 1 || currentRoundIndex >= totalGameRounds) {
            return Array.from(currentActiveParticipants);
        }

        const nextSequenceValue = currentSequenceValue + 1;
        const currentRoundResponse = playerResponses[currentRoundIndex];
        const expectedPhrase = transformNumberToPhrase(nextSequenceValue);

        const sortedParticipants = Array.from(currentActiveParticipants).sort((a, b) => a - b);
        const participantOnTurn = sortedParticipants[activeParticipantPointer];

        let updatedParticipantSet = new Set(currentActiveParticipants);
        let nextParticipantPointer = activeParticipantPointer;

        if (currentRoundResponse !== expectedPhrase) {
            updatedParticipantSet.delete(participantOnTurn);
            if (updatedParticipantSet.size === 0) {
                return [];
            }
            nextParticipantPointer = activeParticipantPointer % updatedParticipantSet.size;
        } else {
            nextParticipantPointer = (activeParticipantPointer + 1) % updatedParticipantSet.size;
        }

        return recursiveRoundProcessor(
            updatedParticipantSet,
            currentRoundIndex + 1,
            nextSequenceValue,
            nextParticipantPointer
        );
    };

    const startingParticipants = new Set(Array.from({ length: initialPlayerCount }, (_, idx) => idx + 1));
    return recursiveRoundProcessor(startingParticipants, 0, 0, 0);
};

const rawInput = require('fs').readFileSync('/dev/stdin', 'utf8');
const allInputLinesCleaned = rawInput.trim().split("\n");

const structuredData = parseInputDataRecursive(allInputLinesCleaned);
const finalOutputLines = processGameBatches(structuredData);

finalOutputLines.forEach(line => console.log(line));