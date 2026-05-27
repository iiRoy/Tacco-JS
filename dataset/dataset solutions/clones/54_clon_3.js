const dataStack = [];
const fileSystemModule = require("fs");

const rawInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
const processedInputString = rawInputContent.trim();
const inputLinesArray = processedInputString.split('\n');

function handleLineOperation(currentInputItem) {
    const parsedNumericValue = Number(currentInputItem);

    if (parsedNumericValue > 0) {
        dataStack.push(currentInputItem);
    } else {
        console.log(dataStack.pop());
    }
}

inputLinesArray.map(handleLineOperation);
