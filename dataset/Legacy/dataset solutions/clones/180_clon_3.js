function checkPrimality(candidateNumber) {
    if (candidateNumber < 2) {
        return false;
    }
    if (candidateNumber === 2 || candidateNumber === 3) {
        return true;
    }
    if (candidateNumber % 2 === 0 || candidateNumber % 3 === 0) {
        return false;
    }

    const upperBound = Math.round(Math.sqrt(candidateNumber));
 
    let factorIterator = 1;
    let currentMultipleOfSix;
    while(true) {
        currentMultipleOfSix = factorIterator * 6;
        const lowerFactor = currentMultipleOfSix - 1;
        const upperFactor = currentMultipleOfSix + 1;

        if (lowerFactor > upperBound) {
            break;
        }

        if (candidateNumber % lowerFactor === 0 || candidateNumber % upperFactor === 0) {
            return false;
        }
        factorIterator++;
    }
    return true;
}

const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = rawData.trim().split('\n');
 
let lineIndex = 0;
while (lineIndex < inputLines.length) {
    const currentLine = inputLines[lineIndex++];
    const targetNumber = parseInt(currentLine, 10);

    let previousPrime;
    let nextPrime;

    if (targetNumber === 3) {
        previousPrime = 2;
    }

    let primeSearchIterator = 3;
    let foundNextPrime = false;
    
    while (!foundNextPrime) {
        const isCurrentPrime = checkPrimality(primeSearchIterator);

        if (isCurrentPrime) {
            if (primeSearchIterator < targetNumber) {
                previousPrime = primeSearchIterator;
            } else if (primeSearchIterator > targetNumber) {
                nextPrime = primeSearchIterator;
                foundNextPrime = true;
            }
        }
        primeSearchIterator += 2;
    }
    console.log(previousPrime, nextPrime);
}
