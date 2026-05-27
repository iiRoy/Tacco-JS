const inputReader = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

let rawInputLines = [];
inputReader.on('line', (line) => rawInputLines.push(line));
inputReader.on('close', () => {
    console.error("\n");
    const startTime = new Date();
    executeMainLogic();
    const endTime = new Date() - startTime;

    logDebug("time : " + (endTime) + "ms");
    logDebug("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

let currentInputLineIndex = 0;

function retrieveNextLine() {
    if (currentInputLineIndex >= rawInputLines.length) {
        throw new Error("Input line index out of bounds.");
    }
    return rawInputLines[currentInputLineIndex++];
}

function parseInteger() {
    return parseInt(retrieveNextLine(), 10);
}

function parseIntegerArray() {
    return retrieveNextLine().split(" ").map(Number);
}

function displayOutput(dataArray) {
    console.log(dataArray.join("\n"));
}

function logDebug(message) {
    console.error("debug:" + require("util").inspect(message, false, null));
}

function executeMainLogic() {
    const totalDays = parseInteger();
    const satisfactionCosts = parseIntegerArray();
    const dailyScoreLists = Array.from({ length: totalDays }, () => parseIntegerArray());

    const lastActivityDay = new Array(26).fill(0);

    const cumulativeScores = dailyScoreLists.reduce((acc, dailyScores, dayIndex) => {
        const currentDay = dayIndex + 1;

        const { score: bestScore, index: bestIndex } = dailyScores.reduce(
            (maxInfo, currentScore, contestIndex) =>
                currentScore > maxInfo.score ? { score: currentScore, index: contestIndex } : maxInfo,
            { score: -Infinity, index: -1 }
        );

        lastActivityDay[bestIndex] = currentDay;

        const adjustedScore = satisfactionCosts.reduce((currentDayScore, cost, contestTypeIndex) => {
            return currentDayScore - cost * (currentDay - lastActivityDay[contestTypeIndex]);
        }, bestScore);

        logDebug(adjustedScore);

        const previousCumulative = acc.length > 0 ? acc[acc.length - 1] : 0;
        const currentCumulative = adjustedScore + previousCumulative;

        acc.push(currentCumulative);
        return acc;
    }, []);

    displayOutput(cumulativeScores);
}
