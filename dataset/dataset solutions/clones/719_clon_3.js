const MAX_POSSIBLE_VALUE = 1000000000;

function generateSequenceTerms(targetLimit, includeOnlyOddTerms) {
    let currentSequenceLength = 0;
    let currentTerm = 1;
    let termIncrement = 1;
    let incrementStep = 1;
    const sequenceTerms = [0];

    while (currentTerm <= targetLimit) {
        const shouldIncludeTerm = !includeOnlyOddTerms || (currentTerm % 2 !== 0);
        if (shouldIncludeTerm) {
            currentSequenceLength++;
            sequenceTerms.push(currentTerm);
        }

        incrementStep++;
        termIncrement += incrementStep;
        currentTerm += termIncrement;
    }
    return { terms: sequenceTerms, length: currentSequenceLength };
}

function solveMinItemsDP(targetValue, sequenceData) {
    const availableItems = sequenceData.terms;
    const sequenceLength = sequenceData.length;

    const dpTable = Array(5).fill(null).map(() => Array(targetValue + 1).fill(0));

    dpTable[0][0] = 0;
    for (let colIdx = 1; colIdx <= targetValue; colIdx++) {
        dpTable[0][colIdx] = MAX_POSSIBLE_VALUE;
    }

    for (let fullRowIdx = 1; fullRowIdx <= sequenceLength; fullRowIdx++) {
        const currentRowIdx = fullRowIdx % 5;
        const previousRowIdx = (fullRowIdx - 1) % 5;

        const currentItemValue = availableItems[fullRowIdx];

        dpTable[currentRowIdx][0] = 0;

        for (let colIdx = 1; colIdx <= targetValue; colIdx++) {
            const valueWithoutCurrentItem = dpTable[previousRowIdx][colIdx];

            let valueWithCurrentItem = MAX_POSSIBLE_VALUE;
            if (colIdx >= currentItemValue) {
                const remainingSum = colIdx - currentItemValue;
                const resultForRemaining = dpTable[currentRowIdx][remainingSum];
                if (resultForRemaining !== MAX_POSSIBLE_VALUE) {
                    valueWithCurrentItem = resultForRemaining + 1;
                }
            }

            dpTable[currentRowIdx][colIdx] = Math.min(valueWithoutCurrentItem, valueWithCurrentItem);
        }
    }

    const finalRowIdx = sequenceLength % 5;
    return dpTable[finalRowIdx][targetValue];
}

function calculateSumAll(targetValue) {
    const sequenceInfo = generateSequenceTerms(targetValue, false);
    return solveMinItemsDP(targetValue, sequenceInfo);
}

function calculateSumOdd(targetValue) {
    const sequenceInfo = generateSequenceTerms(targetValue, true);
    return solveMinItemsDP(targetValue, sequenceInfo);
}

function processInput(rawInputData) {
    const inputLines = rawInputData.split("\n");

    let lineCounter = 0;
    while (true) {
        const currentNumber = parseInt(inputLines[lineCounter], 10);
        if (currentNumber === 0) {
            break;
        }
        console.log(calculateSumAll(currentNumber), calculateSumOdd(currentNumber));
        lineCounter++;
    }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
