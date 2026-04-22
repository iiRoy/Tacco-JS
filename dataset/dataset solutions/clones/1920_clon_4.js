'use strict';

const processPayload = (incomingPayload) => {
    const
        dataLines = incomingPayload.trim().split('\n'),
        requiredAmount = Number(dataLines[0]);

    const initialValue = 100;
    const growthFactor = 1.01;

    if (requiredAmount <= initialValue) {
        return 0;
    }

    const logRatio = Math.log(requiredAmount / initialValue);
    const logRate = Math.log(growthFactor);

    const iterationsNeeded = Math.ceil(logRatio / logRate);

    return iterationsNeeded;
};

const obtainContent = (resourcePath) => {
    const fileSystemUtil = require('fs');
    return fileSystemUtil.readFileSync(resourcePath, 'utf8');
};

const executeComputation = (sourcePath) => {
    const rawData = obtainContent(sourcePath);
    const finalOutcome = processPayload(rawData);
    console.log(finalOutcome);
};

executeComputation('/dev/stdin');