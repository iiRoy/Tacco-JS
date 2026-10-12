'use strict';

function parseContestData(rawData) {
    const parsedLines = rawData.trim().split('\n');
    const numDays = Number(parsedLines[0]);
    const contestCosts = parsedLines[1].split(' ').map(Number);
    const satisfactionScores = parsedLines
        .slice(2, 2 + numDays)
        .map(line => line.split(' ').map(Number));
    return { numDays, contestCosts, satisfactionScores };
}

function calculatePenaltiesForDay(currentDay, contestCosts, lastHeldDay) {
    const numContestTypes = contestCosts.length;
    const dailyPenalties = Array(numContestTypes).fill(0);
    for (let typeIndex = 0; typeIndex < numContestTypes; typeIndex++) {
        const daysSinceLastHeld = currentDay - lastHeldDay[typeIndex];
        dailyPenalties[typeIndex] = -(contestCosts[typeIndex] * daysSinceLastHeld);
    }
    return dailyPenalties;
}

function computePotentialDailyScores(currentDay, satisfactionScores, currentPenalties) {
    const numContestTypes = currentPenalties.length;
    const potentialScores = Array(numContestTypes).fill(0);

    for (let typeIndex = 0; typeIndex < numContestTypes; typeIndex++) {
        const simulatedScores = [...currentPenalties];
        simulatedScores[typeIndex] = satisfactionScores[currentDay - 1][typeIndex];
        potentialScores[typeIndex] = simulatedScores.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    }
    return potentialScores;
}

function identifyBestContest(dailyScores) {
    let highestScore = -Infinity;
    let bestContestType = -1;

    for (let typeIndex = 0; typeIndex < dailyScores.length; typeIndex++) {
        if (dailyScores[typeIndex] > highestScore) {
            highestScore = dailyScores[typeIndex];
            bestContestType = typeIndex;
        }
    }
    return { bestContestType, highestScore };
}

function solveContestScheduling(rawData) {
    const { numDays, contestCosts, satisfactionScores } = parseContestData(rawData);

    const numContestTypes = contestCosts.length;
    let lastHeldDay = Array(numContestTypes).fill(0);

    for (let currentDay = 1; currentDay <= numDays; currentDay++) {
        const currentPenalties = calculatePenaltiesForDay(currentDay, contestCosts, lastHeldDay);
        const potentialDailyScores = computePotentialDailyScores(currentDay, satisfactionScores, currentPenalties);
        
        const { bestContestType } = identifyBestContest(potentialDailyScores);
        
        lastHeldDay[bestContestType] = currentDay;
        console.log(bestContestType + 1);
    }
}

solveContestScheduling(require('fs').readFileSync('/dev/stdin', 'utf8'));
