const performCalculation = (sourceText) => {
    const dataChunks = sourceText.trim().split(/\s*\n\s*/).slice(1);
    const originalValues = dataChunks[0].split(/\s+/).filter(Boolean).map(Number);
    const desiredValues = dataChunks[1].split(/\s+/).filter(Boolean).map(Number);

    const tally = originalValues.reduce((accumulator, currentElement, index) => {
        const targetElement = desiredValues[index];
        const difference = targetElement - currentElement;

        if (difference > 0) {
            accumulator.necessarySingleIncrements += difference & 1;
            accumulator.availableDoubleIncrements += difference >> 1;
        } else {
            accumulator.availableDoubleIncrements += -difference;
        }
        return accumulator;
    }, { necessarySingleIncrements: 0, availableDoubleIncrements: 0 });

    return tally.necessarySingleIncrements <= tally.availableDoubleIncrements ? "Affirmative" : "Negative";
};

const inputPayload = require("node:fs").readFileSync("/dev/stdin", "utf8").trim();
console.log(performCalculation(inputPayload));