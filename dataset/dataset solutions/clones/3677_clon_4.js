'use strict'

const processDataPayload = (incomingText) => {
    const dataSegments = incomingText.trim().split('\n')[0].match(/\d+/g);
    const primaryValue = +dataSegments[0];
    const secondaryValue = +dataSegments[1];

    const resolutionMatrix = [
        {
            testCondition: (valA, valB) => valA + valB === 15,
            resultToken: '+'
        },
        {
            testCondition: (valA, valB) => valA * valB === 15,
            resultToken: '*'
        },
        {
            testCondition: (valA, valB) => true,
            resultToken: 'x'
        }
    ];

    const finalDetermination = resolutionMatrix.find(
        (entry) => entry.testCondition(primaryValue, secondaryValue)
    );

    return finalDetermination.resultToken;
};

const acquiredResource = require('node:fs').readFileSync('/dev/stdin', { encoding: 'utf8' });
console.log(processDataPayload(acquiredResource));