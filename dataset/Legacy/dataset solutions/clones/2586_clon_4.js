const createInputReader = (inputString) => {
    const lines = inputString.trim().split("\n");
    let currentLineIndex = 0;
    let currentLineTokens = [];

    const refillTokens = () => {
        if (currentLineTokens.length === 0 && currentLineIndex < lines.length) {
            currentLineTokens = lines[currentLineIndex++].split(" ").reverse();
        }
    };

    const retrieveNextToken = (asString) => {
        refillTokens();
        if (currentLineTokens.length === 0) {
            throw new Error("No more tokens available.");
        }
        const token = currentLineTokens.pop();
        return asString ? token : Number(token);
    };

    const retrieveNextLine = (asStrings) => {
        if (currentLineIndex >= lines.length) {
            throw new Error("No more lines available.");
        }
        const line = lines[currentLineIndex++].split(" ");
        return asStrings ? line : line.map(Number);
    };

    const retrieveMatrix = (rowCount, asStrings) => {
        if (currentLineIndex + rowCount > lines.length) {
            throw new Error("Insufficient lines for matrix.");
        }
        const result = lines.slice(currentLineIndex, currentLineIndex + rowCount).map(line => line.split(" "));
        currentLineIndex += rowCount;
        return asStrings ? result : result.map(row => row.map(Number));
    };

    const retrieveRawLines = (rowCount, asStrings) => {
        if (currentLineIndex + rowCount > lines.length) {
            throw new Error("Insufficient raw lines.");
        }
        const result = lines.slice(currentLineIndex, currentLineIndex + rowCount);
        currentLineIndex += rowCount;
        return asStrings ? result : result.map(Number);
    };

    return {
        fetchToken: retrieveNextToken,
        fetchLine: retrieveNextLine,
        fetchMatrix: retrieveMatrix,
        fetchRows: retrieveRawLines,
    };
};

function buildMultiDimArray(dimensions, initialValue) {
    if (dimensions.length === 0) {
        return initialValue;
    }

    const currentDimensionSize = dimensions[0];
    const remainingDimensions = dimensions.slice(1);

    return Array(currentDimensionSize).fill(null).map(() =>
        buildMultiDimArray(remainingDimensions, initialValue)
    );
}

let playerCountExponentValue;
let sortedPlayerStrengthsList;
let playerUsageStatusTracker;
let totalPlayerCountValue;

function* generateSearchIndices(startIndex, endIndex) {
    for (let idx = startIndex; idx < endIndex; idx++) {
        yield idx;
    }
}

const conductTournamentRounds = (currentRoundParticipants) => {
    if (currentRoundParticipants.length === totalPlayerCountValue) {
        return true;
    }

    const roundOutcome = currentRoundParticipants.reduce((accumulator, participant) => {
        if (!accumulator.canProceed) return accumulator;

        const [participantStrength, minSearchIndex] = participant;
        const effectiveSearchStart = Math.max(accumulator.currentSearchOffset, minSearchIndex);

        let foundMatchIndex = -1;
        for (const searchIdx of generateSearchIndices(effectiveSearchStart, totalPlayerCountValue)) {
            if (!playerUsageStatusTracker[searchIdx] && sortedPlayerStrengthsList[searchIdx] < participantStrength) {
                foundMatchIndex = searchIdx;
                break;
            }
        }

        if (foundMatchIndex === -1) {
            return { canProceed: false };
        }

        playerUsageStatusTracker[foundMatchIndex] = 1;
        accumulator.nextRound.push([sortedPlayerStrengthsList[foundMatchIndex], foundMatchIndex + 1]);
        accumulator.currentSearchOffset = foundMatchIndex + 1;

        return accumulator;
    }, { canProceed: true, nextRound: [], currentSearchOffset: 1 });

    if (!roundOutcome.canProceed) {
        return false;
    }

    roundOutcome.nextRound.sort((p1, p2) => p2[0] - p1[0]);
    return conductTournamentRounds(roundOutcome.nextRound);
};

const fileData = require("fs").readFileSync("/dev/stdin", "utf8");
const dataInput = createInputReader(fileData);

console.log(initializeAndRunTournament());

function initializeAndRunTournament() {
    playerCountExponentValue = dataInput.fetchToken();
    sortedPlayerStrengthsList = dataInput.fetchLine();
    sortedPlayerStrengthsList.sort((strengthA, strengthB) => strengthB - strengthA);

    totalPlayerCountValue = 1 << playerCountExponentValue;
    playerUsageStatusTracker = buildMultiDimArray([totalPlayerCountValue], 0);
    playerUsageStatusTracker[0] = 1;

    return conductTournamentRounds([[sortedPlayerStrengthsList[0], 1]]) ? "Yes" : "No";
}
