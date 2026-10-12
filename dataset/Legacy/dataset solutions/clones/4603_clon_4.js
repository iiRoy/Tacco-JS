"use strict";

const processInputAndDetermineOutcome = (rawInputString) => {
    const [firstLineContent] = rawInputString.trim().split('\n');
    const [factorOne, divisorValue, targetRemainder] = firstLineContent.split(' ').map(Number);

    const sequenceLength = divisorValue;
    const isTargetReachable = Array.from({ length: sequenceLength }, (_, currentIteration) => currentIteration)
                                 .some(iterationIndex => {
                                     const calculatedRemainder = (factorOne * iterationIndex) % divisorValue;
                                     return calculatedRemainder === targetRemainder;
                                 });

    return isTargetReachable ? "YES" : "NO";
};

const executeProgram = (inputSourceModule) => {
    const programInput = inputSourceModule.readFileSync('/dev/stdin', 'utf8');
    const finalVerdict = processInputAndDetermineOutcome(programInput);
    console.log(finalVerdict);
};

executeProgram(require('fs'));
