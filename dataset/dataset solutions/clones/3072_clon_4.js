'use strict';

const retrieveSourceContent = () => require("fs").readFileSync("/dev/stdin", "utf8");

const analyzeNumericFeed = (incomingDataStream) => {
    const parsedEntities = incomingDataStream
        .split('\n')
        .filter(segment => segment.trim() !== '')
        .map(Number);

    if (parsedEntities.length < 2) {
        console.log(NaN);
        return;
    }

    const primaryTarget = parsedEntities[0];
    const auxiliaryMeasures = parsedEntities.slice(1);

    const criticalThreshold = Math.min(...auxiliaryMeasures);

    const limitingConstraint = Math.ceil(primaryTarget / criticalThreshold);

    const finalEvaluation = limitingConstraint + 4;

    console.log(finalEvaluation);
};

analyzeNumericFeed(retrieveSourceContent());