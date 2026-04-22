"use strict";

const processIncomingData = (sourceString) => {
    const numericalEntities = sourceString.trim().split(/\s+/).map(element => Number(element));
    const [ enumeration, lowerBoundary, upperBoundary ] = numericalEntities;
    return { enumeration, lowerBoundary, upperBoundary };
};

const determineOutputValue = (parameters) => {
    const { enumeration, lowerBoundary, upperBoundary } = parameters;

    return (lowerBoundary > upperBoundary)
        ? 0
        : (enumeration === 1)
            ? (lowerBoundary === upperBoundary ? 1 : 0)
            : ((enumeration - 2) * (upperBoundary - lowerBoundary) + 1);
};

const orchestrateExecution = (inputContent) => {
    const interpretedParameters = processIncomingData(inputContent);
    const computedResult = determineOutputValue(interpretedParameters);
    console.log(computedResult);
};

orchestrateExecution(require('node:fs').readFileSync(0, 'utf8'));