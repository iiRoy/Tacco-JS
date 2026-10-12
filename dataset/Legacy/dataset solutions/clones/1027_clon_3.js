var fsModule = require('fs');
var rawInputData = fsModule.readFileSync('/dev/stdin', 'utf8');
var allInputLines = rawInputData.split('\n');

var operationLines = allInputLines.slice(1);

var managedList = [];

const INSERT_OPERATION_KEY = 'insert';
const DELETE_OPERATION_KEY = 'delete';
const DELETE_FIRST_OPERATION_KEY = 'deleteFirst';
const DELETE_LAST_OPERATION_KEY = 'deleteLast';
const DELIMITER_CHAR = ' ';

function removeFirstMatchingElement(targetCollection, valueToEliminate) {
    const elementPosition = targetCollection.indexOf(valueToEliminate);
    if (elementPosition !== -1) {
        targetCollection.splice(elementPosition, 1);
    }
}

for (const currentOpString of operationLines) {
    const opComponents = currentOpString.split(DELIMITER_CHAR);

    const commandType = opComponents[0];
    const commandValue = opComponents[1];

    switch (commandType) {
        case INSERT_OPERATION_KEY:
            managedList.unshift(commandValue);
            break;
        case DELETE_OPERATION_KEY:
            removeFirstMatchingElement(managedList, commandValue);
            break;
        case DELETE_FIRST_OPERATION_KEY:
            managedList.shift();
            break;
        case DELETE_LAST_OPERATION_KEY:
            managedList.pop();
            break;
    }
}

console.log(managedList.join(DELIMITER_CHAR));
