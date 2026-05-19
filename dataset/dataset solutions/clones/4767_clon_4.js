const fileSystem = require('fs');

function calculateFactorialDivisors(inputLines) {
    const primeModulo = 1000000007;
    const maximumValue = Number(inputLines[0]);

    const compositeTracker = new Array(maximumValue + 1).fill(false);
    const discoveredPrimes = [];

    for (let numberIterator = 2; numberIterator <= maximumValue; numberIterator++) {
        if (!compositeTracker[numberIterator]) {
            discoveredPrimes.push(numberIterator);
            for (let multipleIterator = numberIterator * numberIterator; multipleIterator <= maximumValue; multipleIterator += numberIterator) {
                compositeTracker[multipleIterator] = true;
            }
        }
    }

    let finalProduct = 1;

    for (const currentPrimeNumber of discoveredPrimes) {
        let primePowerSum = 0;
        let currentPower = currentPrimeNumber;
        while (currentPower <= maximumValue) {
            primePowerSum += Math.floor(maximumValue / currentPower);
            if (currentPower > maximumValue / currentPrimeNumber) {
                break;
            }
            currentPower *= currentPrimeNumber;
        }
        finalProduct = (finalProduct * (primePowerSum + 1)) % primeModulo;
    }

    console.log(finalProduct.toString());
}

const standardInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
const parsedInputLines = standardInputContent.split('\n');
calculateFactorialDivisors(parsedInputLines);
