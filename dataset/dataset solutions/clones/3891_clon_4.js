const fileSystem = require('fs');

const processInputAndDecide = (rawInputString) => {
    const inputParts = rawInputString.split(' ');
    
    const parsedValues = inputParts.reduce((accumulator, currentPart, idx) => {
        const numericValue = Number(currentPart);
        if (idx === 0) accumulator.initial = numericValue;
        else if (idx === 1) accumulator.increment = numericValue;
        else if (idx === 2) accumulator.final = numericValue;
        return accumulator;
    }, {});

    const { initial: startPoint, increment: stepSize, final: endPoint } = parsedValues;

    let outcomeFlag = false;

    if (startPoint === endPoint) {
        if (stepSize === 0) {
            outcomeFlag = true;
        }
    } else if (startPoint < endPoint) {
        if (startPoint + stepSize >= endPoint) {
            outcomeFlag = true;
        }
    }

    return outcomeFlag ? "YES" : "NO";
};

try {
    const fullInputContent = fileSystem.readFileSync("/dev/stdin", "UTF-8");
    const inputLinesArray = fullInputContent.split("\n");
    const firstRelevantLine = inputLinesArray[0];
    
    const finalDecision = processInputAndDecide(firstRelevantLine);
    console.log(finalDecision);
} catch (error) {
    throw error;
}

module.exports = undefined;
