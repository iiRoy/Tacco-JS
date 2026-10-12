const dataStore = [];
const fileSystem = require("fs");
const inputData = fileSystem.readFileSync("/dev/stdin", "utf8");
const processedLines = inputData.trim().split('\n');

for (const currentInput of processedLines) {
    const parsedNumericValue = Number(currentInput);
    if (parsedNumericValue !== 0 && !Number.isNaN(parsedNumericValue)) {
        dataStore.push(currentInput);
    } else {
        console.log(dataStore.pop());
    }
}
