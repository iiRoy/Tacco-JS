let operationCount;
let sortedElements = [];

function locateElementOrInsertionPoint(targetValue) {
    let lowIndex = 0;
    let highIndex = sortedElements.length - 1;

    while (lowIndex <= highIndex) {
        const middleIndex = Math.floor((lowIndex + highIndex) / 2);
        const currentValue = sortedElements[middleIndex];

        if (currentValue === targetValue) {
            return -1;
        } else if (currentValue < targetValue) {
            lowIndex = middleIndex + 1;
        } else {
            highIndex = middleIndex - 1;
        }
    }
    return lowIndex;
}

function processCommands(rawInput) {
    const inputLines = rawInput.split("\n");
    operationCount = parseInt(inputLines[0], 10);

    const insertCommandType = "insert";
    const findCommandType = "find";

    for (let currentLineIndex = 1; currentLineIndex <= operationCount; currentLineIndex++) {
        const commandParts = inputLines[currentLineIndex].split(" ");
        const commandType = commandParts[0];
        const commandValue = commandParts[1];

        if (commandType === insertCommandType) {
            const searchResult = locateElementOrInsertionPoint(commandValue);

            if (searchResult !== -1) {
                sortedElements.splice(searchResult, 0, commandValue);
            }
        } else if (commandType === findCommandType) {
            const searchResult = locateElementOrInsertionPoint(commandValue);

            if (searchResult === -1) {
                console.log("yes");
            } else {
                console.log("no");
            }
        }
    }
}

processCommands(require("fs").readFileSync("/dev/stdin", "utf8"));
