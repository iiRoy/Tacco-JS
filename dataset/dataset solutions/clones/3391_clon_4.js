"use strict";

function SolveProblem(inputString) {
    const finalResult = inputString.split('').reduce((accumulatorState, currentSymbol, currentPosition) => {
        if (currentSymbol === 'W') {
            accumulatorState.netShifts += currentPosition - accumulatorState.processedWhites;
            accumulatorState.processedWhites += 1;
        }
        return accumulatorState;
    }, { netShifts: 0, processedWhites: 0 });

    console.log(finalResult.netShifts);
}

SolveProblem(require("fs").readFileSync("/dev/stdin", "utf8"));