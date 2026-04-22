"use strict";

function PrimaryProcessor(initialSource) {
    let processedInput = initialSource.toString().split(/\s+/).filter(Boolean);
    let outcomeRegister = [];

    const acquireNumber = () => Number.parseInt(processedInput.shift(), 10);
    const storeOutcome = (value) => outcomeRegister.push(String(value));

    const computeSequenceLength = (currentPoint, currentTally) => {
        if (currentPoint === 1) {
            return currentTally;
        }

        if (currentPoint & 1) {
            return computeSequenceLength((currentPoint << 1) + currentPoint + 1, currentTally + 1);
        } else {
            return computeSequenceLength(currentPoint >> 1, currentTally + 1);
        }
    };

    let startingValue = acquireNumber();

    if (startingValue === 1 || startingValue === 2) {
        storeOutcome(4);
    } else {
        storeOutcome(computeSequenceLength(startingValue, 2));
    }

    const finalOutput = outcomeRegister.join("\n");
    console.log(finalOutput);
    return finalOutput;
}

PrimaryProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));