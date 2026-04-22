'use strict'

const processNumericalString = (dataPacket) => {
    const numericalComponents = dataPacket.match(/-?\d+/g);
    const firstValue = Number(numericalComponents[0]);
    const secondValue = Number(numericalComponents[1]);
    const thirdValue = Number(numericalComponents[2]);

    const determineInclusivity = (valA, valB, valC) => {
        return (valC - valA) * (valC - valB) < 0;
    };

    return determineInclusivity(firstValue, secondValue, thirdValue) ? 'Yes' : 'No';
};

const acquiredData = require('fs').readFileSync('/dev/stdin', 'utf8');
console.log(processNumericalString(acquiredData));