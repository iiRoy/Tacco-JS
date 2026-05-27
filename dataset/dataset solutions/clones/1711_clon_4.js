'use strict';

function scheduleOptimizer(inputData) {
    const parsedInput = inputData.trim().split('\n');
    const numDays = Number(parsedInput[0]);
    const dropCoefficients = parsedInput[1].split(' ').map(Number);
    const satisfactionMatrix = parsedInput
        .slice(2, 2 + numDays)
        .map((line) => line.split(' ').map(Number));

    let lastHeldEventDay = Array(dropCoefficients.length).fill(0);

    Array.from({ length: numDays }, (_, dayIdx) => dayIdx + 1).forEach((currentDay) => {
        const currentDaySatisfaction = satisfactionMatrix[currentDay - 1];

        const individualDropValues = dropCoefficients.map((coeff, eventIdx) =>
            coeff * (currentDay - lastHeldEventDay[eventIdx])
        );

        const totalDropSum = individualDropValues.reduce((acc, val) => acc + val, 0);

        const potentialEventScores = currentDaySatisfaction.map((baseSatisfaction, eventIdx) =>
            baseSatisfaction - totalDropSum + individualDropValues[eventIdx]
        );

        let selectedEvent = 0;
        let highestScore = 0;

        potentialEventScores.forEach((score, eventIdx) => {
            if (score > highestScore) {
                highestScore = score;
                selectedEvent = eventIdx;
            }
        });

        lastHeldEventDay[selectedEvent] = currentDay;

        console.log(selectedEvent + 1);
    });
}

scheduleOptimizer(require('fs').readFileSync('/dev/stdin', 'utf8'));
