"use strict";

const processInputAndFindSolution = (inputData) => {
    const parsedLines = inputData.trim().split("\n");
    const targetConstant = parseInt(parsedLines[0]);

    function* generateCombinations() {
        for (let firstVar = 1; firstVar <= 3500; firstVar++) {
            for (let secondVar = 1; secondVar <= 3500; secondVar++) {
                yield { hVal: firstVar, nVal: secondVar };
            }
        }
    }

    for (const { hVal: currentH, nVal: currentN } of generateCombinations()) {
        const numeratorTerm = targetConstant * currentH * currentN;
        const denominatorTerm = 4 * currentH * currentN - targetConstant * currentN - targetConstant * currentH;

        if (denominatorTerm > 0) {
            const calculatedW = numeratorTerm / denominatorTerm;

            if (Number.isInteger(calculatedW)) {
                console.log(`${currentH} ${currentN} ${calculatedW}`);
                return;
            }
        }
    }
};

processInputAndFindSolution(require('fs').readFileSync('/dev/stdin', 'utf8'));
