function calculatePrimeCount(upperBound) {
    const MARKER_INDICATOR = true;
    let isPrimeTracker = [];
    let currentNumber;
    let multipleIterator;
    let collectedPrimes = [];

    for (currentNumber = 2; currentNumber <= upperBound; ++currentNumber) {
        if (!isPrimeTracker[currentNumber]) {
            collectedPrimes.push(currentNumber);

            const startingMultiple = currentNumber * 2;

            for (multipleIterator = startingMultiple; multipleIterator <= upperBound; multipleIterator += currentNumber) {
                isPrimeTracker[multipleIterator] = MARKER_INDICATOR;
            }
        }
    }
    return collectedPrimes.length;
}

const fileSystemUtility = require('fs');
const rawInputString = fileSystemUtility.readFileSync('/dev/stdin', 'utf8');

const numberGlobalObject = Number;
const valueForPrimeFunction = numberGlobalObject.input;

console.log(calculatePrimeCount(valueForPrimeFunction));
