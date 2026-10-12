function processNumber(inputVal) {
    let matchFound = false;
    const maxIterationCount = 9;

    for (let currentDivisor = 1; currentDivisor <= maxIterationCount; currentDivisor++) {
        const divisionRemainder = inputVal % currentDivisor;
        const divisionResult = inputVal / currentDivisor;

        const isPerfectlyDivisible = divisionRemainder === 0;
        const quotientIsBelowTen = divisionResult < 10;

        if (isPerfectlyDivisible && quotientIsBelowTen) {
            matchFound = true;
            break;
        }
    }

    if (matchFound) {
        console.log('Yes');
    } else {
        console.log('No');
    }
}

const fileSystem = require('fs');
const standardInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
const numericInput = parseInt(standardInputContent.trim(), 10);

processNumber(numericInput);
