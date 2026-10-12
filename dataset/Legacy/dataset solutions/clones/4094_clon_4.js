module.exports = function executeSolution() {
    const fileSystem = require("fs");
    const standardInputContent = fileSystem.readFileSync("/dev/stdin", "utf8");

    function* tokenStreamGenerator(textInput) {
        const tokens = textInput.trim().split(/\s+/g);
        for (const currentToken of tokens) {
            yield currentToken;
        }
    }

    const inputTokenIterator = tokenStreamGenerator(standardInputContent);

    const obtainNextInteger = () => {
        const { value: tokenValue, done: isDone } = inputTokenIterator.next();
        if (isDone) {
            return NaN;
        }
        return parseInt(tokenValue, 10);
    };

    const sequenceLength = obtainNextInteger();
    const numericSequence = Array.from({ length: sequenceLength }, obtainNextInteger);

    const finalResultBounds = numericSequence.reduceRight((accumulatorState, currentSequenceValue) => {
        if (accumulatorState === null) {
            return null;
        }

        const { currentMin: previousMinBound, currentMax: previousMaxBound } = accumulatorState;

        let nextMultipleOfCurrent = Math.ceil((previousMaxBound + 1) / currentSequenceValue) * currentSequenceValue;

        const calculatedMaxBound = nextMultipleOfCurrent - 1;
        const calculatedMinBound = nextMultipleOfCurrent - currentSequenceValue;

        if (calculatedMaxBound < currentSequenceValue || calculatedMinBound > calculatedMaxBound) {
            return null;
        }

        return { currentMin: calculatedMinBound, currentMax: calculatedMaxBound };
    }, { currentMin: 2, currentMax: 2 });

    if (finalResultBounds === null) {
        console.log(-1);
    } else {
        console.log(`${finalResultBounds.currentMin} ${finalResultBounds.currentMax}`);
    }
};

if (require.main === module) {
    module.exports();
}
