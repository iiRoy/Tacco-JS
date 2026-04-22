'use strict';

let storageUnit = '';

process.stdin.on('data', (incomingBytes) => {
    storageUnit += incomingBytes.toString();
});

process.stdin.on('end', () => {
    const cleansedInput = storageUnit.trim();
    const initialNumericalValue = Number(cleansedInput);

    const firstCoefficient = 90;
    const secondCoefficient = 2;
    const thirdCoefficient = 120;
    const fourthCoefficient = 3;

    const partialSum = initialNumericalValue * firstCoefficient * secondCoefficient;
    const adjustmentValue = thirdCoefficient * fourthCoefficient;

    const ultimateCalculation = partialSum - adjustmentValue;

    process.stdout.write(String(ultimateCalculation) + '\n');
});