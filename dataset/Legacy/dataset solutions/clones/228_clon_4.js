var fs = require('fs');
initiateProcessing();

function initiateProcessing() {
    var inputData = fs.readFileSync(process.stdin.fd, 'utf8').split('\n');
    const primeSequence = generatePrimeNumbers(49999);
    const sumFrequencies = new Map();

    primeSequence.forEach((firstPrime, idx1) => {
        for (let idx2 = 0; idx2 <= idx1; idx2++) {
            const secondPrime = primeSequence[idx2];
            const currentSum = firstPrime + secondPrime;

            if (currentSum > 50000) {
                break;
            }
            sumFrequencies.set(currentSum, (sumFrequencies.get(currentSum) || 0) + 1);
        }
    });

    inputData
        .map(s => parseInt(s, 10))
        .filter(n => !isNaN(n) && n !== 0)
        .forEach(queryValue => {
            console.log(sumFrequencies.get(queryValue) || 0);
        });
}

function generatePrimeNumbers(limitValue) {
    const isComposite = new Array(limitValue + 1).fill(false);
    isComposite[0] = true;
    isComposite[1] = true;

    for (let currentNum = 2; currentNum * currentNum <= limitValue; currentNum++) {
        if (!isComposite[currentNum]) {
            for (let multiple = currentNum * currentNum; multiple <= limitValue; multiple += currentNum) {
                isComposite[multiple] = true;
            }
        }
    }

    const collectedPrimes = [];
    for (let num = 2; num <= limitValue; num++) {
        if (!isComposite[num]) {
            collectedPrimes.push(num);
        }
    }

    return collectedPrimes;
}
