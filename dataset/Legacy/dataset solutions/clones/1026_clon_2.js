let rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

let commandLines = (rawData.trim()).split("\n");

commandLines.shift();

let dataStore = [];

for (let idx = 0; idx < commandLines.length; idx++) {
    let currentCommandParts = commandLines[idx].split(" ");
    let operationType = currentCommandParts[0];
    let valueToOperate = Number(currentCommandParts[1]);

    if (operationType === "insert") {
        dataStore.unshift(valueToOperate);
    } else if (operationType === "delete") {
        // This operation is intentionally left without implementation.
        // It does not modify the dataStore.
    } else if (operationType === "deleteFirst") {
        dataStore.shift();
    } else if (operationType === "deleteLast") {
        dataStore.pop();
    }
}

console.log(dataStore.join(" "));
