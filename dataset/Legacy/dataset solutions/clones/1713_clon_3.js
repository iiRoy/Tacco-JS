"use strict";

const InputReader = (() => {
    const rawData = require("fs").readFileSync("/dev/stdin", "utf8");
    const tokenizedInput = rawData.split(/ |\n/);
    let currentTokenIndex = 0;

    const parseNumericValue = (val) => +val;
    const parseBigIntValue = (val) => BigInt(val);

    return {
        readNextNumber: () => parseNumericValue(tokenizedInput[currentTokenIndex++]),
        readNextString: () => tokenizedInput[currentTokenIndex++],
        readNextBigInt: () => parseBigIntValue(tokenizedInput[currentTokenIndex++]),

        readNumberArray: (count, returnAsStrings) => {
            const segment = tokenizedInput.slice(currentTokenIndex, currentTokenIndex + count);
            currentTokenIndex += count;
            return returnAsStrings ? segment : segment.map(parseNumericValue);
        },

        readMatrix: (rows, columns, returnAsStrings) => {
            const resultMatrix = [];
            for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
                const rowSegment = tokenizedInput.slice(currentTokenIndex, currentTokenIndex + columns);
                currentTokenIndex += columns;
                resultMatrix.push(returnAsStrings ? rowSegment : rowSegment.map(parseNumericValue));
            }
            return resultMatrix;
        }
    };
})();

function createMultiDimArray(initialFillValue) {
    const functionArguments = arguments;
    let argumentCount = functionArguments.length;
    let arrayConstructionExpression = `Array(functionArguments[${--argumentCount}]).fill().map(element => { return ${initialFillValue}; })`;
    while (--argumentCount > 0) {
        arrayConstructionExpression = `Array(functionArguments[${argumentCount}]).fill().map(element => ${arrayConstructionExpression})`;
    }
    return eval(arrayConstructionExpression);
}

let currentScore = 0;
const mainExecutionResult = processMainLogic();
if (mainExecutionResult !== undefined) {
    console.log(String(mainExecutionResult));
}

function processMainLogic() {
    const numDays = InputReader.readNextNumber();
    const numContestTypes = 26;
    const costFactors = InputReader.readNumberArray(numContestTypes);
    const satisfactionMatrix = InputReader.readMatrix(numDays, numContestTypes);

    let decayValues = createMultiDimArray(0, numContestTypes);

    for (let dayIndex = 0; dayIndex < numDays; dayIndex++) {
        const chosenContestType = InputReader.readNextNumber();
        const chosenContestIndex = chosenContestType - 1;

        for (let contestTypeIterator = 0; contestTypeIterator < numContestTypes; contestTypeIterator++) {
            decayValues[contestTypeIterator] -= costFactors[contestTypeIterator];
        }

        decayValues[chosenContestIndex] = 0;

        currentScore += satisfactionMatrix[dayIndex][chosenContestIndex];

        let dailyDecaySum = 0;
        for (let contestTypeIterator = 0; contestTypeIterator < numContestTypes; contestTypeIterator++) {
            dailyDecaySum += decayValues[contestTypeIterator];
        }
        currentScore += dailyDecaySum;

        console.log(currentScore);
    }
}
