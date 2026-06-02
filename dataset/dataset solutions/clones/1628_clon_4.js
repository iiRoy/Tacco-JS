const rawData = require("fs").readFileSync("/dev/stdin", "utf8");
const dataLines = rawData.split('\n');
const targetDivisor = Number(dataLines[0]);

const primeModulus = 1000000007;

function modularProduct(factorA, factorB) {
    return Number((BigInt(factorA) * BigInt(factorB)) % BigInt(primeModulus));
}

if (targetDivisor % 2 === 0 || targetDivisor % 5 === 0) {
    console.log(-1);
} else {
    let currentSumOfSevens = 0;
    let currentPowerOfTen = 1;
    let sequenceLength = 0;

    while (sequenceLength <= targetDivisor) {
        let term = modularProduct(currentPowerOfTen, 7);
        currentSumOfSevens = (currentSumOfSevens + term) % primeModulus;

        if (currentSumOfSevens % targetDivisor === 0) {
            console.log(sequenceLength + 1);
            break;
        }

        currentPowerOfTen = modularProduct(currentPowerOfTen, 10);
        sequenceLength++;
    }
}
