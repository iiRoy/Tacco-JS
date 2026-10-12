function logOutput(text) { console.log(text); }

const readInputFromFile = (filePath) => require("fs").readFileSync(filePath, "utf8").trim();

const getChar = (str, index) => str.charAt(index);

function processInputData(rawData) {
    const inputLines = rawData.split("\n");
    const dataLength = parseInt(inputLines[0], 10);
    const directionString = inputLines[1];

    if (dataLength === 0) {
        logOutput(0);
        return;
    }

    const charW = 'W';
    const charE = 'E';

    const westPrefixCounts = Array(dataLength).fill(0);
    let currentWestAccumulator = 0;
    for (let idx = 0; idx < dataLength; idx++) {
        if (getChar(directionString, idx) === charW) {
            currentWestAccumulator++;
        }
        westPrefixCounts[idx] = currentWestAccumulator;
    }

    let totalEastCount = 0;
    for (let idx = 0; idx < dataLength; idx++) {
        if (getChar(directionString, idx) === charE) {
            totalEastCount++;
        }
    }

    const eastSuffixCounts = Array(dataLength).fill(0);
    let remainingEastAccumulator = totalEastCount;
    for (let idx = 0; idx < dataLength; idx++) {
        if (getChar(directionString, idx) === charE) {
            remainingEastAccumulator--;
        }
        eastSuffixCounts[idx] = remainingEastAccumulator;
    }

    let minTurnsRequired = dataLength;

    for (let idx = 0; idx < dataLength; idx++) {
        const leaderChar = getChar(directionString, idx);

        const westTurns = (leaderChar === charW) ? westPrefixCounts[idx] - 1 : westPrefixCounts[idx];
        const eastTurns = eastSuffixCounts[idx];

        const currentLeaderTurns = westTurns + eastTurns;
        minTurnsRequired = Math.min(minTurnsRequired, currentLeaderTurns);
    }

    logOutput(minTurnsRequired);
}

processInputData(readInputFromFile("/dev/stdin"));
