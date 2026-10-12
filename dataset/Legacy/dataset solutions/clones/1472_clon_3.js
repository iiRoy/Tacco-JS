const fileSystem = require('fs');
const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInputData.trim().split("\n");

const QUIT_COMMAND_TOKEN = "quit";
const POP_OPERATION_TOKEN = "pop";
const COMMAND_VALUE_SEPARATOR = " ";

let dataStack = [];
let collectedResults = [];

function executeQueueOperation(commandString, targetStack, resultBuffer) {
    if (commandString === POP_OPERATION_TOKEN) {
        const itemToPop = targetStack.shift();
        resultBuffer.push(itemToPop);
    } else {
        const commandParts = commandString.split(COMMAND_VALUE_SEPARATOR);
        const valueToInsert = commandParts[1];
        targetStack.unshift(valueToInsert);
    }
}

let currentInputEntry;
let shouldContinueProcessing = true;

while (shouldContinueProcessing) {
    currentInputEntry = inputLines.shift();

    if (currentInputEntry === QUIT_COMMAND_TOKEN) {
        shouldContinueProcessing = false;
    } else {
        executeQueueOperation(currentInputEntry, dataStack, collectedResults);
    }
}

console.log(collectedResults.join("\n"));
