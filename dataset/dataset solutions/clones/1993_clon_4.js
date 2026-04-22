const RAW_DATA_BUFFER = require("fs").readFileSync(0, "utf8");
const NUMERIC_TOKENS_ARRAY = RAW_DATA_BUFFER.split(/\s+/).filter(Boolean).map(Number);
let dataPointerIndex = 0;

const getNextValue = () => NUMERIC_TOKENS_ARRAY[dataPointerIndex++];

const COPRIME_BASE = 1000000007;

function safeModularMultiply(factorA, factorB) {
    let accumulator = 0;
    factorA %= COPRIME_BASE;
    factorB %= COPRIME_BASE;

    while (factorB > 0) {
        if (factorB & 1) {
            accumulator = (accumulator + factorA) % COPRIME_BASE;
        }
        factorA = (factorA + factorA) % COPRIME_BASE;
        factorB >>= 1;
    }
    return accumulator;
}

function modularExponentiation(baseValue, exponentValue) {
    let result = 1;
    baseValue %= COPRIME_BASE;

    while (exponentValue > 0) {
        if (exponentValue & 1) {
            result = safeModularMultiply(result, baseValue);
        }
        baseValue = safeModularMultiply(baseValue, baseValue);
        exponentValue >>= 1;
    }
    return result;
}

function performMainCalculation() {
    const inputN = getNextValue();
    const inputK = getNextValue();

    const sequenceCounts = new Array(inputK + 1).fill(0);
    let totalResult = inputK;

    sequenceCounts[inputK] = 1;

    for (let currentIdx = inputK - 1; currentIdx >= 1; --currentIdx) {
        let calculatedCount = modularExponentiation(Math.floor(inputK / currentIdx), inputN);

        for (let multipleOfIdx = currentIdx + currentIdx; multipleOfIdx <= inputK; multipleOfIdx += currentIdx) {
            calculatedCount = (calculatedCount - sequenceCounts[multipleOfIdx] + COPRIME_BASE) % COPRIME_BASE;
        }
        sequenceCounts[currentIdx] = calculatedCount;
        totalResult = (totalResult + safeModularMultiply(sequenceCounts[currentIdx], currentIdx)) % COPRIME_BASE;
    }
    return totalResult;
}

console.log(performMainCalculation());