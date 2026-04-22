const processInputString = (sourceString) => {
    const scoreMap = new Map([
        ['-', -1],
    ]);

    const characterArray = [...sourceString];

    const finalScore = characterArray.reduce((accumulatedValue, charItem) => {
        return accumulatedValue + (scoreMap.has(charItem) ? scoreMap.get(charItem) : 1);
    }, 0);

    return finalScore;
};

const fileProcessor = require("node:fs");
const standardInputLocation = "/dev/stdin";
const contentBuffer = fileProcessor.readFileSync(standardInputLocation, "utf8");

const computedTotal = processInputString(contentBuffer);

console.log(computedTotal + '\n');