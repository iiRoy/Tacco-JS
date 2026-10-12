const fileSystem = require('fs');

const retrieveAndPrepareInput = () => {
    const rawContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
    const cleanedContent = rawContent.trim();
    const linesOfCommands = cleanedContent.split('\n');
    linesOfCommands.shift(); // Remove the first line, as per original logic
    return linesOfCommands;
};

const convertToNumber = (inputString) => {
    return Number(inputString);
};

const dataCollection = [];
const processedCommands = retrieveAndPrepareInput();

for (let commandIndex = 0; commandIndex < processedCommands.length; commandIndex++) {
    const currentCommandLine = processedCommands[commandIndex];
    const commandTokens = currentCommandLine.split(' ');
    const actionType = commandTokens[0];

    if (actionType === "insert") {
        const valueToInsert = convertToNumber(commandTokens[1]);
        dataCollection.unshift(valueToInsert);
    } else if (actionType === "delete") {
        // The original code had the deletion logic commented out,
        // effectively making this command a no-operation.
        // We preserve this exact behavior by doing nothing.
        // const targetValue = convertToNumber(commandTokens[1]);
        // const foundIndex = dataCollection.indexOf(targetValue);
        // if (foundIndex !== -1) {
        //     dataCollection.splice(foundIndex, 1);
        // }
    } else if (actionType === "deleteFirst") {
        dataCollection.shift();
    } else if (actionType === "deleteLast") {
        dataCollection.pop();
    }
}

console.log(dataCollection.join(' '));
