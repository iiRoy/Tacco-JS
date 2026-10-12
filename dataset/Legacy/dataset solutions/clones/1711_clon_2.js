'use strict';

function ProcessInput(rawData) {
    const parsedLines = rawData.trim().split('\n');
    const numDays = Number(parsedLines[0]);
    const contestCosts = parsedLines[1].split(' ').map((val) => Number(val));
    const satisfactionScores = parsedLines
        .slice(2, 2 + numDays)
        .map((val) => val.split(' ').map((val) => Number(val)));

    let lastHeldDates = Array(26).fill(0); // Last day each contest type was held
    let currentDayScores = Array(26).fill(0); // Satisfaction scores for each contest type on the current day
    let scoreDecrements = Array(26).fill(0); // Score reduction for each contest type due to not being held

    for (let dayIndex = 1; dayIndex <= numDays; dayIndex++) {
        // Calculate score decrements for all contest types
        for (let costIndex = 0; costIndex < contestCosts.length; costIndex++) {
            scoreDecrements[costIndex] = contestCosts[costIndex] * (dayIndex - lastHeldDates[costIndex]) * -1;
        }

        // Calculate total scores for each contest type if it were held today
        for (let scoreCalcIndex = 0; scoreCalcIndex < contestCosts.length; scoreCalcIndex++) {
            const tempDecrements = [...scoreDecrements]; // Create a temporary copy
            tempDecrements[scoreCalcIndex] = satisfactionScores[dayIndex - 1][scoreCalcIndex]; // Replace decrement with actual satisfaction for this type
            const totalScore = tempDecrements.reduce((accumulator, currentVal) => accumulator + currentVal);
            currentDayScores[scoreCalcIndex] = totalScore;
        }

        let chosenContestType = 0;
        let highestScore = 0;

        // Determine which contest type to hold based on maximum score
        for (let contestTypeIndex = 0; contestTypeIndex < contestCosts.length; contestTypeIndex++) {
            if (highestScore < currentDayScores[contestTypeIndex]) {
                highestScore = currentDayScores[contestTypeIndex];
                chosenContestType = contestTypeIndex;
            }
        }

        // Update the last held date for the chosen contest type
        lastHeldDates[chosenContestType] = dayIndex;
        console.log(chosenContestType + 1);
    }

    return;
}
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
