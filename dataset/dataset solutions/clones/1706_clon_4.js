"use strict";

const acquireNumericStream = (sourcePath) => {
    const rawData = require("fs").readFileSync(sourcePath, "utf8");
    const tokenArray = rawData.split(/ |\n/);
    let currentTokenIndex = 0;

    return {
        retrieveNextValue: () => {
            return Number(tokenArray[currentTokenIndex++]);
        }
    };
};

function performCoreComputation() {
    const dataProvider = acquireNumericStream("/dev/stdin");

    const primaryCount = dataProvider.retrieveNextValue();

    const cumulativeSumStart = Array.from({ length: primaryCount }, (_, index) => index + 1)
                                    .reduce((totalAccumulator, currentK) => {
                                        const triangularNumber = currentK * (currentK + 1) / 2;
                                        return totalAccumulator + triangularNumber;
                                    }, 0);

    const finalAdjustedSum = Array.from({ length: primaryCount - 1 }).reduce((currentRunningTotal) => {
        let firstOperand = dataProvider.retrieveNextValue();
        let secondOperand = dataProvider.retrieveNextValue();

        [firstOperand, secondOperand] = firstOperand > secondOperand ? [secondOperand, firstOperand] : [firstOperand, secondOperand];

        return currentRunningTotal - (firstOperand * (primaryCount - secondOperand + 1));
    }, cumulativeSumStart);

    return finalAdjustedSum;
}

const programResult = performCoreComputation();
if (programResult !== undefined) {
    console.log(String(programResult));
}
