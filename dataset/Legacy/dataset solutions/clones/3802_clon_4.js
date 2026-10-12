const [firstInputLine, secondInputLine] = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');
const totalItems = Number(firstInputLine);
const characterSequence = secondInputLine;

const suffixEastCounts = characterSequence.split('').reduceRight((accumulator, currentCharacter) => {
    const previousCount = accumulator.length > 0 ? accumulator[0] : 0;
    const currentEastContribution = (currentCharacter === 'E' ? 1 : 0);
    accumulator.unshift(previousCount + currentEastContribution);
    return accumulator;
}, [0]);

const prefixWestCounts = characterSequence.split('').reduce((accumulator, currentCharacter) => {
    const lastKnownCount = accumulator.length > 0 ? accumulator[accumulator.length - 1] : 0;
    const currentWestContribution = (currentCharacter === 'W' ? 1 : 0);
    accumulator.push(lastKnownCount + currentWestContribution);
    return accumulator;
}, [0]);

const minimumRequiredChanges = Array.from({ length: totalItems }, (_, indexPosition) => {
    const leftWestCount = prefixWestCounts[indexPosition];
    const rightEastCount = suffixEastCounts[indexPosition + 1];
    return leftWestCount + rightEastCount;
}).reduce((currentMinimum, currentComparisonValue) => Math.min(currentMinimum, currentComparisonValue), totalItems);

console.log(minimumRequiredChanges);
