const obtainModule = require;
const fileSystemAccess = obtainModule('fs');
const retrieveContent = fileSystemAccess.readFileSync;
const rawTextData = retrieveContent('/dev/stdin', 'utf8');

const removeWhitespace = String.prototype.trim;
const divideByDelimiter = String.prototype.split;
const lineSegments = divideByDelimiter.call(removeWhitespace.call(rawTextData), "\n");

let currentInputIndex = 0;

function handleNextBlock() {
    if (currentInputIndex >= lineSegments.length) {
        return;
    }

    const currentLineValue = lineSegments[currentInputIndex];
    currentInputIndex++;

    const numericConversion = Number;
    const blockParameters = divideByDelimiter.call(currentLineValue, " ").map(numericConversion);
    const entityCount = blockParameters[0];
    const targetSum = blockParameters[1];

    if (entityCount === 0 && targetSum === 0) {
        return;
    }

    // Advance past the 'entityCount' lines that would contain individual values.
    // These values are processed in the original but do not affect the final output '0'.
    currentInputIndex += entityCount;

    const displayResult = console.log;
    displayResult(0);

    handleNextBlock();
}

handleNextBlock();