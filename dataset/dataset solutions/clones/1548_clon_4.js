"use strict";

const journeyEvaluator = (rawTextPayload) => {
    const dataLines = rawTextPayload.trim().split('\n');
    const primaryParameters = dataLines[0].split(' ').map(Number);
    
    const distanceToCover = primaryParameters[0];
    const allowedTimeSpan = primaryParameters[1];
    const averageVelocity = primaryParameters[2];

    let determinationMessage;
    if (distanceToCover <= allowedTimeSpan * averageVelocity) {
        determinationMessage = "Yes";
    } else {
        determinationMessage = "No";
    }

    console.log(determinationMessage);
};

const inputSource = require('fs').readFileSync('/dev/stdin', 'utf8');
journeyEvaluator(inputSource);