const fileSystem = require('fs');

function determineNonDivisibleCount(rangeLimit, firstFactor, secondFactor) {
    if (rangeLimit <= 0) {
        return 0;
    }

    const countByFirst = Math.floor(rangeLimit / firstFactor);
    const countBySecond = Math.floor(rangeLimit / secondFactor);
    const countByBoth = Math.floor(rangeLimit / (firstFactor * secondFactor));

    const countByEither = countByFirst + countBySecond - countByBoth;

    return rangeLimit - countByEither;
}

const inputData = fileSystem.readFileSync('/dev/stdin', 'utf8');

const firstLineOfInput = inputData.split('\n')[0];
const numericalComponents = firstLineOfInput.split(' ');

const startRange = Number(numericalComponents[0]);
const endRange = Number(numericalComponents[1]);
const divisorA = Number(numericalComponents[2]);
const divisorB = Number(numericalComponents[3]);

const effectiveLength = endRange - startRange + 1;

const finalResult = determineNonDivisibleCount(effectiveLength, divisorA, divisorB);

console.log(finalResult);
