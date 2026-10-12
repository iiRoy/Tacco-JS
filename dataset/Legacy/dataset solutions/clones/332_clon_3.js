var logOutput = console.log;

function createInputReader(rawData) {
    const inputLines = rawData.split("\n");
    let lineIndex = 0;
    return function () {
        return inputLines[lineIndex++];
    };
}

String.prototype.repeatString = function repeatString(count) {
    let resultStr = "";
    for (let k = 0; k < count; k++) {
        resultStr += this.toString();
    }
    return resultStr;
};

function parseIntegerLine(inputLineStr, isOneBased) {
    const strParts = inputLineStr.split(' ');
    const adjustOffset = isOneBased ? -1 : 0; // This variable is declared but not used in the original logic.
    const parsedNumbers = strParts.map(part => parseInt(part, 10));
    return parsedNumbers;
}

function generateNumberRange(startVal, endVal) {
    return Array.from({ length: endVal - startVal }, (_, index) => startVal + index);
}

const findMaximum = (valA, valB) => valA > valB ? valA : valB;

const findMinimum = (valA, valB) => valA < valB ? valA : valB;

function createObjectKeyComparator(keyName) {
    return function (itemA, itemB) {
        if (itemA[keyName] < itemB[keyName]) return -1;
        else if (itemA[keyName] > itemB[keyName]) return 1;
        return 0;
    };
}

// Constants for game logic
const OUT_LIMIT = 3;
const BASES_LOADED_RUNNERS = 3;
const HIT_ACTION = 'HIT';
const HOMERUN_ACTION = 'HOMERUN';

// Helper to process a single play outcome
function processSinglePlay(playOutcome, currentRunners, currentOuts, teamScores, activeTeamIndex) {
    let updatedRunners = currentRunners;
    let updatedOuts = currentOuts;
    let runsScoredThisPlay = 0;

    if (playOutcome === HIT_ACTION) {
        if (updatedRunners === BASES_LOADED_RUNNERS) {
            runsScoredThisPlay = 1;
        } else {
            updatedRunners++;
        }
    } else if (playOutcome === HOMERUN_ACTION) {
        runsScoredThisPlay = updatedRunners + 1;
        updatedRunners = 0; // Clear bases
    } else { // Any other outcome is an out
        updatedOuts++;
    }

    teamScores[activeTeamIndex] += runsScoredThisPlay;
    return { runners: updatedRunners, outs: updatedOuts };
}

function simulateBaseballGame(gameInputData) {
    const getNextInputLine = createInputReader(gameInputData);
    const totalInningsCount = parseInt(getNextInputLine(), 10);
    let activeTeamIndex = 0; // 0 for team A, 1 for team B
    const teamScoresArray = [0, 0]; // Scores for team A and team B

    // Loop through each half-inning
    for (let halfInningIdx = 0; halfInningIdx < totalInningsCount * 2; halfInningIdx++) {
        let currentOuts = 0;
        let currentRunners = 0;

        // Simulate plays until 3 outs are recorded
        while (currentOuts < OUT_LIMIT) {
            const playResult = getNextInputLine();
            const playUpdate = processSinglePlay(playResult, currentRunners, currentOuts, teamScoresArray, activeTeamIndex);
            currentRunners = playUpdate.runners;
            currentOuts = playUpdate.outs;
        }
        // Switch to the next team for the next half-inning
        activeTeamIndex = (activeTeamIndex + 1) % 2;
    }

    logOutput(teamScoresArray[0]);
    logOutput(teamScoresArray[1]);
}

simulateBaseballGame(require("fs").readFileSync("/dev/stdin", "utf8"));
