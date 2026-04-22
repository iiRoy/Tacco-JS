"use strict";

const performScoreEvaluation = (sourceTextData) => {
    const individualPoints = sourceTextData
                                .trim()
                                .split(/\s+/)
                                .slice(0, 3)
                                .map(Number);

    const calculatedTotal = individualPoints.reduce((accumulator, currentPoint) => accumulator + currentPoint, 0);

    const outcomeMessages = ["bust", "win"];

    const finalDecision = outcomeMessages[+(calculatedTotal <= 21)];

    console.log(finalDecision);
};

const systemInputHandler = require('fs');
const receivedContent = systemInputHandler.readFileSync('/dev/stdin', 'utf8');

performScoreEvaluation(receivedContent);