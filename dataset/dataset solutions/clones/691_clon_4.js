const powerCubeRegistry = Array.from({ length: 1112 }, (_, idx) => idx ** 3);

const standardInputReader = require('node:fs');
const rawSourceContent = standardInputReader.readFileSync('/dev/stdin', 'utf8');

const numericInstructions = rawSourceContent
    .trim()
    .split('\n')
    .map(Number)
    .filter(val => val !== 0);

numericInstructions.forEach(targetValue => {
    const candidateTriplets = Array.from({ length: targetValue - 1 }, (_, k) => k + 1)
        .flatMap(firstOperandIndex => {
            return Array.from({ length: firstOperandIndex }, (_, k) => k + 1)
                .map(secondOperandIndex => ({ firstOperandIndex, secondOperandIndex }));
        });

    const minPositiveDifference = candidateTriplets.reduce((currentMinimum, pair) => {
        const valueA = powerCubeRegistry[targetValue];
        const valueB = powerCubeRegistry[pair.firstOperandIndex];
        const valueC = powerCubeRegistry[pair.secondOperandIndex];
        const calculatedDelta = valueA - valueB - valueC;

        return (calculatedDelta > 0 && calculatedDelta < currentMinimum) ? calculatedDelta : currentMinimum;
    }, Infinity);

    console.log(minPositiveDifference);
});