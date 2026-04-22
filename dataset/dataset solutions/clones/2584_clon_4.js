'use strict';

const transformString = (inputChain) => {
    return Array.from(inputChain).reduce((accumulator, currentUnit) => {
        if (accumulator.length === 0 || accumulator[accumulator.length - 1] !== currentUnit) {
            accumulator.push(currentUnit);
        }
        return accumulator;
    }, []).join('');
};

const evolveSequence = (currentChain, remainingIterations) => {
    if (remainingIterations === 0 || currentChain.length <= 1) {
        return currentChain;
    }
    const nextChain = currentChain[0] + currentChain.substring(3);
    return evolveSequence(nextChain, remainingIterations - 1);
};

const orchestrateComputation = (receivedData) => {
    const dataUnits = receivedData.split('\n');
    const [originalMagnitude, transformationRounds] = dataUnits[0].split(' ').map(Number);
    const sourceString = dataUnits[1];

    const reducedString = transformString(sourceString);
    const terminalString = evolveSequence(reducedString, transformationRounds);

    const resultMetric = originalMagnitude - terminalString.length;
    console.log(resultMetric);
};

const initiateProcess = () => {
    let collectedInput = "";
    process.stdin.resume();
    process.stdin.setEncoding("utf8");

    process.stdin.on("data", segment => {
        collectedInput += segment;
    });

    process.stdin.on("end", () => {
        orchestrateComputation(collectedInput);
    });
};

initiateProcess();