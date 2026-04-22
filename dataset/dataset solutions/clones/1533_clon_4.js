const sourceData = require("fs").readFileSync("/dev/stdin", "utf8");
const stringArray = sourceData.split('\n');
const gridDimension = parseInt(stringArray[0].trim(), 10);

const modulusValue = 1000000007;

const MAX_N_COMB = gridDimension + 5;
const factorialCache = new Array(MAX_N_COMB);
const invFactorialCache = new Array(MAX_N_COMB);

function power(base, exp) {
    let res = 1;
    base %= modulusValue;
    while (exp > 0) {
        if (exp % 2 === 1) res = (res * base) % modulusValue;
        base = (base * base) % modulusValue;
        exp = Math.floor(exp / 2);
    }
    return res;
}

function modularInverse(n) {
    return power(n, modulusValue - 2);
}

factorialCache[0] = 1;
invFactorialCache[0] = 1;
for (let h = 1; h < MAX_N_COMB; h++) {
    factorialCache[h] = (factorialCache[h - 1] * h) % modulusValue;
    invFactorialCache[h] = modularInverse(factorialCache[h]);
}

function retrieveCombinations(upperN, lowerK) {
    if (lowerK < 0 || lowerK > upperN) {
        return 0;
    }
    let term1 = factorialCache[upperN];
    let term2 = invFactorialCache[lowerK];
    let term3 = invFactorialCache[upperN - lowerK];

    let result = (term1 * term2) % modulusValue;
    result = (result * term3) % modulusValue;
    return result;
}

const iterationLimit = Math.floor(gridDimension / 3);

const finalAccumulatedValue = Array.from({ length: iterationLimit }, (_, index) => index)
    .reduce((currentSum, currentIdx) => {
        const nParam = gridDimension - (2 * currentIdx) - 3;
        const kParam = currentIdx;

        if (nParam >= kParam && kParam >= 0) {
            return (currentSum + retrieveCombinations(nParam, kParam)) % modulusValue;
        } else {
            return currentSum;
        }
    }, 0);

process.stdout.write(finalAccumulatedValue + '\n');