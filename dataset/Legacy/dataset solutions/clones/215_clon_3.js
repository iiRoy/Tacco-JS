var primeCache = [-1, 2, 3, 5, 7, 11, 13];

function getNthPrime(primeIndex) {
    if (primeIndex < primeCache.length && primeCache[primeIndex] !== undefined) {
        return primeCache[primeIndex];
    }

    var lastCachedPrime = primeCache[primeCache.length - 1];
    var currentCandidate = lastCachedPrime + 2;
    
    while (true) {
        if (checkPrimality(currentCandidate)) {
            primeCache.push(currentCandidate);
            if (primeCache.length - 1 === primeIndex) {
                return currentCandidate;
            }
        }
        currentCandidate += 2;
    }
}

function checkPrimality(candidateNum) {
    if (candidateNum % 3 === 0) return false;

    var sqrtLimit = Math.round(Math.sqrt(candidateNum));
    var k = 1;
    while (k * 6 - 1 <= sqrtLimit) {
        var factorA = k * 6 - 1;
        var factorB = k * 6 + 1;
        if (candidateNum % factorA === 0 || candidateNum % factorB === 0) {
            return false;
        }
        k++;
    }
    return true;
}

var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var inputLines = rawData.split('\n');
 
var currentLine;
while ((currentLine = inputLines.shift()) !== undefined) {
    var inputNumber = +currentLine;
    if (inputNumber === 0) {
        break;
    }

    var sumOfPrimes = 0;
    for (var primeCounter = 1; primeCounter <= inputNumber; primeCounter++) {
        sumOfPrimes += getNthPrime(primeCounter);
    }
    console.log(sumOfPrimes);
}
