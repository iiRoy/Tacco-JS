const fileSystem = require("fs");

const processInputData = function(rawInputContent) {
    const inputTokens = rawInputContent.trim().split(/\s+/g);

    let currentTokenIndex = 0;

    const retrieveNextInteger = () => {
        if (currentTokenIndex >= inputTokens.length) {
            throw new Error("Input stream exhausted unexpectedly.");
        }
        const parsedValue = parseInt(inputTokens[currentTokenIndex], 10);
        currentTokenIndex++;
        return parsedValue;
    };

    const totalNumbersToProcess = retrieveNextInteger();

    const numericalSequence = Array.from({ length: totalNumbersToProcess }, retrieveNextInteger);

    const { maximumConsecutiveLength } = numericalSequence.reduce((accumulator, currentNumber) => {
        const lengthEndingAtPrevious = accumulator.sequenceLengths.get(currentNumber - 1) || 0;
        const lengthEndingAtCurrent = lengthEndingAtPrevious + 1;

        accumulator.sequenceLengths.set(currentNumber, lengthEndingAtCurrent);
        accumulator.maximumConsecutiveLength = Math.max(accumulator.maximumConsecutiveLength, lengthEndingAtCurrent);

        return accumulator;
    }, { sequenceLengths: new Map(), maximumConsecutiveLength: 0 });

    console.log(totalNumbersToProcess - maximumConsecutiveLength);
};

module.exports = processInputData;

const standardInputPath = "/dev/stdin";
const contentFromStdin = fileSystem.readFileSync(standardInputPath, "utf8");
processInputData(contentFromStdin);
