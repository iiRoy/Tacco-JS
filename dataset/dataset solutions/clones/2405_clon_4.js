"use strict";

const processInput = (rawInput) => {
    const [lineData] = rawInput.trim().split("\n");
    const [valAStr, valBStr] = lineData.split(" ");
    const valA = parseInt(valAStr, 10);
    const valB = parseInt(valBStr, 10);

    const pointTiers = Object.freeze({
        1: 30000,
        2: 20000,
        3: 10000
    });

    const calculateContribution = (value) => pointTiers[value] || 0;

    const contributionA = calculateContribution(valA);
    const contributionB = calculateContribution(valB);

    const bonusPoints = (valA === 1 && valB === 1) ? 40000 : 0;

    const totalScore = contributionA + contributionB + bonusPoints;

    console.log(totalScore);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
