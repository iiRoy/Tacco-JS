const fileSystemModule = require('fs');

function generatePrimeSequence() {
    const upperBoundary = 50023;
    const isCompositeTracker = new Array(upperBoundary + 1).fill(false);

    isCompositeTracker[0] = true;
    isCompositeTracker[1] = true;

    for (let currentNumber = 2; currentNumber * currentNumber <= upperBoundary; ++currentNumber) {
        if (isCompositeTracker[currentNumber]) {
            continue;
        }
        for (let multiple = currentNumber * currentNumber; multiple <= upperBoundary; multiple += currentNumber) {
            isCompositeTracker[multiple] = true;
        }
    }

    const primeList = [];
    for (let candidate = 0; candidate <= upperBoundary; ++candidate) {
        if (!isCompositeTracker[candidate]) {
            primeList.push(candidate);
        }
    }
    return primeList;
}

function processInputValues() {
    const allKnownPrimes = generatePrimeSequence();

    const findIndexOfFirstGreaterEqual = (sortedArray, targetElement) => {
        let lowIndex = 0;
        let highIndex = sortedArray.length - 1;
        let insertionPoint = sortedArray.length;

        while (lowIndex <= highIndex) {
            const midIndex = Math.floor((lowIndex + highIndex) / 2);
            if (sortedArray[midIndex] >= targetElement) {
                insertionPoint = midIndex;
                highIndex = midIndex - 1;
            } else {
                lowIndex = midIndex + 1;
            }
        }
        return insertionPoint;
    };

    const rawInputText = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
    const numericInputArray = rawInputText.split('\n')
                                         .map(s => s.trim())
                                         .filter(s => s.length > 0)
                                         .map(Number);

    const resultLines = [];

    for (const currentInputValue of numericInputArray) {
        let previousPrime = 0;
        let subsequentPrime = 0;

        const searchPosition = findIndexOfFirstGreaterEqual(allKnownPrimes, currentInputValue);

        // Determine previousPrime (equivalent to original 'min')
        // This is the largest prime strictly less than currentInputValue.
        // It corresponds to allKnownPrimes[k] where allKnownPrimes[k] < currentInputValue and allKnownPrimes[k+1] >= currentInputValue.
        // This k is searchPosition - 1.
        if (searchPosition > 0) {
            previousPrime = allKnownPrimes[searchPosition - 1];
        }

        // Determine subsequentPrime (equivalent to original 'max')
        // This needs to match the original's specific logic:
        // if (nowPrimeNumber <= inp && nextPrimeNumber > inp) { max = nextPrimeNumber; break; }
        // This finds the smallest prime P such that P > currentInputValue, and the prime before P is <= currentInputValue.
        // If currentInputValue is prime, it finds the next prime.
        // If currentInputValue is composite, it finds the smallest prime greater than currentInputValue.
        // For N=1, original output is 0 0. For N=2, original output is 0 3. For N=3, original output is 2 5.

        if (searchPosition < allKnownPrimes.length) {
            if (allKnownPrimes[searchPosition] === currentInputValue) {
                // currentInputValue is prime. Original seeks the next prime.
                if (searchPosition + 1 < allKnownPrimes.length) {
                    subsequentPrime = allKnownPrimes[searchPosition + 1];
                } else {
                    // currentInputValue is the largest prime in the list. No subsequent prime.
                    subsequentPrime = 0;
                }
            } else {
                // currentInputValue is composite, or less than the first prime.
                // Check if allKnownPrimes[searchPosition-1] <= currentInputValue and allKnownPrimes[searchPosition] > currentInputValue.
                // This condition is implicitly met by findIndexOfFirstGreaterEqual if searchPosition > 0.
                // For currentInputValue=1, searchPosition=0. allKnownPrimes[searchPosition-1] is undefined.
                // The original logic for max would not trigger for N=1 (2 <= 1 is false).
                // So, if (searchPosition > 0 && allKnownPrimes[searchPosition - 1] <= currentInputValue)
                // This means the preceding prime is less than or equal to currentInputValue.
                // And allKnownPrimes[searchPosition] is the smallest prime greater than currentInputValue.
                if (searchPosition > 0 && allKnownPrimes[searchPosition - 1] <= currentInputValue) {
                    subsequentPrime = allKnownPrimes[searchPosition];
                }
                // If searchPosition is 0 (e.g., currentInputValue=1), subsequentPrime remains 0.
            }
        } else {
            // currentInputValue is larger than all primes in the list.
            subsequentPrime = 0;
        }

        resultLines.push(`${previousPrime} ${subsequentPrime}`);
    }

    console.log(resultLines.join('\n'));
}

processInputValues();