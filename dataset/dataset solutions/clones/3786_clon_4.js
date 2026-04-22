const fileAccessor = require("node:fs");

const acquiredContent = fileAccessor.readFileSync("/dev/stdin", "utf8");

const numericMatches = acquiredContent.trim().match(/-?\d+/g);

const valueOne = parseInt(numericMatches[0], 10);
const valueTwo = parseInt(numericMatches[1], 10);

const generateVariations = (leftOp, rightOp) => {
    return [
        leftOp + rightOp,
        leftOp - rightOp,
        leftOp * rightOp
    ];
};

const processedVariations = generateVariations(valueOne, valueTwo);

const identifyMaximum = (dataCollection) => {
    return dataCollection.reduce((currentHighest, itemValue) => {
        return currentHighest > itemValue ? currentHighest : itemValue;
    });
};

let finalOutcome = identifyMaximum(processedVariations);

if (Object.is(finalOutcome, -0)) {
    finalOutcome = 0;
}

console.log(finalOutcome);