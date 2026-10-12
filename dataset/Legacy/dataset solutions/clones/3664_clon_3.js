const parseLineToNumbers = (lineContent) => {
    return lineContent.split(" ").map(Number);
};

const fileSystem = require("fs");
const rawInputContent = fileSystem.readFileSync(0, "utf8");
const inputLines = rawInputContent.split("\n");

const initialParametersStr = inputLines[0];
const parsedInitialParams = parseLineToNumbers(initialParametersStr);

const totalItems = parsedInitialParams[0];
const numberOfQueries = parsedInitialParams[1];

const queryLinesStartIndex = 1;
const queryLinesEndIndex = queryLinesStartIndex + numberOfQueries;
const rawQueryStrings = inputLines.slice(queryLinesStartIndex, queryLinesEndIndex);

const queryIntervals = rawQueryStrings.map(parseLineToNumbers);

queryIntervals.sort((intervalA, intervalB) => {
    const endTimeA = intervalA[1];
    const endTimeB = intervalB[1];
    return endTimeA - endTimeB;
});

let selectedIntervalCount = 0;
let lastSelectedIntervalEndTime = -1;

for (const currentInterval of queryIntervals) {
    const currentIntervalStartTime = currentInterval[0];
    const currentIntervalEndTime = currentInterval[1];

    if (lastSelectedIntervalEndTime <= currentIntervalStartTime) {
        lastSelectedIntervalEndTime = currentIntervalEndTime;
        selectedIntervalCount++;
    }
}

console.log(selectedIntervalCount);
