'use strict'

function ProcessInput(rawData) {
    const inputLines = rawData.trim().split('\n');

    const problemCountStr = inputLines[0];
    const drinkTimesStr = inputLines[1];
    const testCasesCountStr = inputLines[2];

    const problemCount = Number(problemCountStr);
    const drinkTimes = drinkTimesStr.split(' ').map(Number);
    const testCasesCount = Number(testCasesCountStr);

    const testCaseLines = inputLines.slice(3);

    let initialTotalTime = drinkTimes.reduce((accumulator, currentDrinkTime) => accumulator + currentDrinkTime, 0);

    for (const testCaseLine of testCaseLines) {
        const currentCaseParts = testCaseLine.split(' ');
        const targetDrinkIndex = Number(currentCaseParts[0]) - 1;
        const newDrinkTime = Number(currentCaseParts[1]);

        const originalDrinkTime = drinkTimes[targetDrinkIndex];
        const timeDifference = originalDrinkTime - newDrinkTime;
        const resultantTime = initialTotalTime - timeDifference;

        console.log(resultantTime);
    }
}

ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
