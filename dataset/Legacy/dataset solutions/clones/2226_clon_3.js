const MAX_PRIME_CANDIDATE = 1000001;
const MODULO_CONSTANT = Math.pow(10, 9) + 7;

function processInput(rawData) {
    const lines = rawData.split("\n");
    const numElements = parseInt(lines[0], 10);
    const initialNumbersStrings = lines[1].split(' ');

    const primeFactorCounts = new Array(numElements);
    const requiredFactorCounts = new Array(numElements);
    const uniquePrimeFactorsSet = new Set();

    const factorizeNumber = (numberToFactor, currentElementIndex) => {
        let tempNumber = numberToFactor;
        for (let factorCandidate = 2; factorCandidate < MAX_PRIME_CANDIDATE; factorCandidate++) {
            if (tempNumber === 1) {
                break;
            }
            while (tempNumber % factorCandidate === 0) {
                primeFactorCounts[currentElementIndex][factorCandidate]++;
                uniquePrimeFactorsSet.add(factorCandidate);
                tempNumber /= factorCandidate;
            }
        }
    };

    for (let elementIndex = 0; elementIndex < numElements; elementIndex++) {
        const currentNumberValue = parseInt(initialNumbersStrings[elementIndex], 10);
        primeFactorCounts[elementIndex] = new Array(MAX_PRIME_CANDIDATE).fill(0);
        requiredFactorCounts[elementIndex] = new Array(MAX_PRIME_CANDIDATE).fill(0);

        factorizeNumber(currentNumberValue, elementIndex);
    }

    const uniquePrimeFactorsArray = Array.from(uniquePrimeFactorsSet).sort((a, b) => a - b);

    const maxGlobalPrimeFactorCounts = new Array(MAX_PRIME_CANDIDATE).fill(0);
    for (const primeFactor of uniquePrimeFactorsArray) {
        let currentMaxCount = 0;
        for (let elementIndex = 0; elementIndex < numElements; elementIndex++) {
            if (primeFactorCounts[elementIndex][primeFactor] > currentMaxCount) {
                currentMaxCount = primeFactorCounts[elementIndex][primeFactor];
            }
        }
        maxGlobalPrimeFactorCounts[primeFactor] = currentMaxCount;
    }

    for (let elementIndex = 0; elementIndex < numElements; elementIndex++) {
        for (const primeFactor of uniquePrimeFactorsArray) {
            requiredFactorCounts[elementIndex][primeFactor] = maxGlobalPrimeFactorCounts[primeFactor] - primeFactorCounts[elementIndex][primeFactor];
        }
    }

    let totalSumOfProducts = 0;
    const individualProductResults = new Array(numElements);

    for (let elementIndex = 0; elementIndex < numElements; elementIndex++) {
        let currentElementProduct = 1;
        for (const primeFactor of uniquePrimeFactorsArray) {
            const neededFactorCount = requiredFactorCounts[elementIndex][primeFactor];
            if (neededFactorCount > 0) {
                currentElementProduct *= Math.pow(primeFactor, neededFactorCount);
            }
        }
        individualProductResults[elementIndex] = currentElementProduct;
        totalSumOfProducts += currentElementProduct;
    }

    console.log(totalSumOfProducts % MODULO_CONSTANT);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
