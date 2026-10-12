const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

const robotUnits = fileContent
  .split('\n')
  .reduce((accumulator, currentLine, lineIndex) => {
    if (lineIndex === 0 || currentLine.trim() === '') {
      return accumulator;
    }
    const parts = currentLine.split(' ');
    accumulator.push([Number(parts[0]), Number(parts[1])]);
    return accumulator;
  }, []);

// The original sort `robots.sort((a, b) => a[i] - b[i]);`
// uses an undefined variable `i`, resulting in `NaN` comparisons.
// This effectively means the array remains in its original input order.
// We preserve this observable behavior by omitting any explicit sort.

console.log(robotUnits);

const retrieveUnitEnd = (unitData) => unitData[0] + unitData[1] - 1;
const retrieveUnitStart = (unitData) => unitData[0] - unitData[1] + 1;

let chosenUnits;
if (robotUnits.length === 0) {
    // Replicate original behavior for empty input: selectedRobots becomes [undefined]
    chosenUnits = [undefined];
} else {
    chosenUnits = robotUnits.reduce((acc, currentUnit) => {
        if (acc.length === 0) {
            // If accumulator is empty, this is the first unit to consider, so select it.
            return [currentUnit];
        }
        const previousUnit = acc[acc.length - 1];
        const previousUnitEnd = retrieveUnitEnd(previousUnit);
        const currentUnitBeginning = retrieveUnitStart(currentUnit);

        if (previousUnitEnd <= currentUnitBeginning) {
            acc.push(currentUnit);
        }
        return acc;
    }, []);
}

console.log(chosenUnits);
console.log(chosenUnits.length);
