function findPrimesUpTo(upperBound) {
    const sieveArray = new Array(upperBound + 1).fill(true);
    sieveArray[0] = false;
    sieveArray[1] = false;

    const limitSqrt = Math.floor(Math.sqrt(upperBound));

    for (let currentNum = 2; currentNum <= limitSqrt; currentNum++) {
        if (sieveArray[currentNum] === false) {
            continue;
        }
        for (let multiple = currentNum * currentNum; multiple <= upperBound; multiple += currentNum) {
            sieveArray[multiple] = false;
        }
    }

    const primeNumbersList = [];
    for (let idx = 0; idx <= upperBound; idx++) {
        if (sieveArray[idx] === true) {
            primeNumbersList.push(idx);
        }
    }
    return primeNumbersList;
}

const precomputedPrimes = findPrimesUpTo(50000);

const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputNumbers = rawData.trim().split("\n").map(Number);

let inputIndex = 0;
while (true) {
    const currentNumber = inputNumbers[inputIndex++];
    if (currentNumber === 0) {
        break;
    }

    const uniquePrimePairs = new Set();

    const findAndStorePairs = (targetSum) => {
        for (let i = 0; i < precomputedPrimes.length; i++) {
            const primeA = precomputedPrimes[i];

            if (primeA >= targetSum) {
                break;
            }

            for (let j = 0; j < precomputedPrimes.length; j++) {
                const primeB = precomputedPrimes[j];

                if (primeB >= targetSum) {
                    break;
                }

                if (primeA + primeB === targetSum) {
                    const canonicalPair = Math.min(primeA, primeB) + "," + Math.max(primeA, primeB);
                    uniquePrimePairs.add(canonicalPair);
                }
            }
        }
    };

    findAndStorePairs(currentNumber);
    console.log(uniquePrimePairs.size);
}
