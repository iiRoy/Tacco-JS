const truncateToInteger = (numericValue) => Math.floor(numericValue);

process.stdin.resume();
process.stdin.setEncoding('utf8');

const MAX_ITERATION_BOUNDARY = 1000;
const PERCENTAGE_BASE_DIVISOR = 100;
const INITIAL_ACCUMULATOR_VALUE = 0;
const MIN_REQUIRED_COMPONENTS = 3;
const EMPTY_STRING_LENGTH = 0;

process.stdin.on('data', function(incomingPayload) {
    const allInputLines = incomingPayload.split(/\r?\n/);

    let currentLineIdentifier = INITIAL_ACCUMULATOR_VALUE;

    for (const singleInputLine of allInputLines) {
        currentLineIdentifier++;

        if (singleInputLine.trim().length === EMPTY_STRING_LENGTH) {
            continue;
        }

        const lineComponentsAsStrings = singleInputLine.trim().split(' ');

        if (lineComponentsAsStrings.length < MIN_REQUIRED_COMPONENTS) {
            continue;
        }

        const operandAValue = Number(lineComponentsAsStrings[0]) || INITIAL_ACCUMULATOR_VALUE;
        const operandBValue = Number(lineComponentsAsStrings[1]) || INITIAL_ACCUMULATOR_VALUE;
        const desiredSumTarget = Number(lineComponentsAsStrings[2]) || INITIAL_ACCUMULATOR_VALUE;

        if (!(operandAValue || operandBValue || desiredSumTarget)) {
            continue;
        }

        const calculatedRateFactorOne = (operandAValue / PERCENTAGE_BASE_DIVISOR) + 1;
        const calculatedRateFactorTwo = (operandBValue / PERCENTAGE_BASE_DIVISOR) + 1;

        let accumulatedMaximumResult = INITIAL_ACCUMULATOR_VALUE;

        for (let primaryLoopIndex = 1; primaryLoopIndex < MAX_ITERATION_BOUNDARY; ++primaryLoopIndex) {
            for (let secondaryLoopIndex = 1; secondaryLoopIndex < MAX_ITERATION_BOUNDARY; ++secondaryLoopIndex) {

                const currentSumForFactorOne = truncateToInteger(primaryLoopIndex * calculatedRateFactorOne) +
                                             truncateToInteger(secondaryLoopIndex * calculatedRateFactorOne);

                if (currentSumForFactorOne === desiredSumTarget) {
                    const currentSumForFactorTwo = truncateToInteger(primaryLoopIndex * calculatedRateFactorTwo) +
                                                 truncateToInteger(secondaryLoopIndex * calculatedRateFactorTwo);

                    accumulatedMaximumResult = Math.max(accumulatedMaximumResult, currentSumForFactorTwo);
                }
            }
        }
        console.log(accumulatedMaximumResult);
    }
});