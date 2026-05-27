const checkPrimality = (val) => {
    if (val % 3 === 0) return false;
    const boundary = Math.round(Math.sqrt(val));
    for (let divisor = 5; divisor <= boundary; divisor += 2) {
        if (val % divisor === 0) return false;
    }
    return true;
};

const primeSequenceManager = (() => {
    const primeStore = [-1, 2, 3, 5, 7, 11, 13];
    let currentCandidate = primeStore[primeStore.length - 1] + 2;

    const findNextPrime = () => {
        while (true) {
            if (checkPrimality(currentCandidate)) {
                const foundPrime = currentCandidate;
                currentCandidate += 2;
                return foundPrime;
            }
            currentCandidate += 2;
        }
    };

    return {
        retrievePrimeByIndex: (index) => {
            if (index < primeStore.length) {
                return primeStore[index];
            }
            while (primeStore.length <= index) {
                primeStore.push(findNextPrime());
            }
            return primeStore[index];
        }
    };
})();

const fileSystem = require('fs');
const rawInput = fileSystem.readFileSync('/dev/stdin', 'utf8');
const dataLines = rawInput.split('\n');

for (const currentLine of dataLines) {
    const numericValue = parseInt(currentLine, 10);
    if (numericValue === 0) {
        break;
    }

    const indicesToSum = Array.from({ length: numericValue }, (_, k) => k + 1);
    const totalSum = indicesToSum.reduce((accumulator, currentIndex) => {
        return accumulator + primeSequenceManager.retrievePrimeByIndex(currentIndex);
    }, 0);

    console.log(totalSum);
}
