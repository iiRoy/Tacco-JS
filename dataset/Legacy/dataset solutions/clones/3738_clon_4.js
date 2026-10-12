'use strict';

function calculateSkuness(numericValue) {
    const digitString = String(numericValue);
    const digitSum = Array.from(digitString).reduce((accumulator, charDigit) => accumulator + Number(charDigit), 0);
    return numericValue / digitSum;
}

function* generateSkunessSequence(limitCount) {
    yield 1; // The first number in the sequence is always 1

    let currentCandidateBase = 2; // This variable tracks the 'x' from the original code

    for (let sequenceIndex = 1; sequenceIndex < limitCount; sequenceIndex++) {
        // Generate all potential numbers for this step:
        // 1. The current base number itself
        // 2. Numbers formed by changing one digit of the current base to '9'
        const potentialNumbers = [currentCandidateBase];
        const baseStringRepresentation = String(currentCandidateBase);

        for (let digitPosition = 0; digitPosition < baseStringRepresentation.length; digitPosition++) {
            const charArray = Array.from(baseStringRepresentation);
            charArray[digitPosition] = '9';
            potentialNumbers.push(Number(charArray.join('')));
        }

        // Find the number among potentialNumbers that yields the minimum 'skuness' value
        const bestChoice = potentialNumbers.reduce(
            (currentBest, numberToCheck) => {
                const skunessOfCurrent = calculateSkuness(numberToCheck);
                if (skunessOfCurrent < currentBest.skunessValue) {
                    return { value: numberToCheck, skunessValue: skunessOfCurrent };
                }
                return currentBest;
            },
            { value: potentialNumbers[0], skunessValue: calculateSkuness(potentialNumbers[0]) } // Initialize with the first potential number
        );

        yield bestChoice.value; // Yield the chosen number for this step
        currentCandidateBase = bestChoice.value + 1; // Update the base for the next iteration
    }
}

function executeProgram(rawData) {
    const lines = rawData.split("\n");
    const firstLineParts = lines[0].split(' ');
    const sequenceLimit = parseInt(firstLineParts[0]);

    for (const resultNumber of generateSkunessSequence(sequenceLimit)) {
        console.log(resultNumber);
    }
    return 0;
}

executeProgram(require("fs").readFileSync("/dev/stdin", "utf8"));
