function processInputData(rawData) {
    const dataLines = rawData.split('\n');
    const numericalValues = dataLines[1].split(' ').map(Number);

    const resultAccumulator = numericalValues.reduce((accumulatorState, currentNumber) => {
        if (currentNumber <= accumulatorState.lowestValueSeen) {
            accumulatorState.recordCounter++;
        }
        accumulatorState.lowestValueSeen = Math.min(accumulatorState.lowestValueSeen, currentNumber);
        return accumulatorState;
    }, { lowestValueSeen: Number.MAX_SAFE_INTEGER, recordCounter: 0 });

    return resultAccumulator.recordCounter;
}

function executeSolution(payload) {
    const finalTally = processInputData(payload);
    console.log(finalTally);
}

const sourceContent = require("fs").readFileSync("/dev/stdin", "utf8");
executeSolution(sourceContent);