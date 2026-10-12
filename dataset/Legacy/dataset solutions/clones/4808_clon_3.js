'use strict'

function processInputData(rawData) {
    const lines = rawData.split('\n');

    const problemCountStr = lines.shift(); // Original N, read but not used.

    const parseNumberArray = (str) => str.split(' ').map(Number);

    const drinkTimesStr = lines.shift();
    const drinkTimes = parseNumberArray(drinkTimesStr);

    const modificationCountStr = lines.shift(); // Original M, read but not used.

    const modificationInstructions = lines.map(line => parseNumberArray(line));

    const initialTotalTime = drinkTimes.reduce((accumulator, currentTimeValue) => {
        return accumulator + currentTimeValue;
    }, 0);

    const calculatedTimes = [];

    const calculateAdjustedTime = (baseTime, timesArray, instruction) => {
        const targetDrinkIndex = instruction[0] - 1;
        const newDrinkValue = instruction[1];
        const originalDrinkValue = timesArray[targetDrinkIndex];

        const valueChange = originalDrinkValue - newDrinkValue;
        const currentAdjustedTime = baseTime - valueChange;
        return currentAdjustedTime;
    };

    for (const instructionPair of modificationInstructions) {
        const adjustedTime = calculateAdjustedTime(initialTotalTime, drinkTimes, instructionPair);
        calculatedTimes.push(adjustedTime);
    }

    calculatedTimes.forEach(finalTime => {
        console.log(finalTime);
    });
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
