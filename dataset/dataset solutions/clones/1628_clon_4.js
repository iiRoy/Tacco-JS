const dataStream = require("fs").readFileSync(0, "utf8");
const parsedRecords = dataStream.split('\n');
const designatedDivisor = BigInt(parsedRecords[0]);

const calculationBaseModulus = 1000000007n;

function determineRepeatingDigitSequenceLength(targetVal) {
    const prohibitedMultiples = [2n, 5n];
    if (prohibitedMultiples.some(factor => targetVal % factor === 0n)) {
        return -1;
    }

    let iterationCounter = 0n;
    let runningTotalModuloBase = 0n;

    while (iterationCounter <= targetVal) {
        iterationCounter++;

        let powerOfTenTerm = 1n;
        for (let exponentIndex = 0n; exponentIndex < iterationCounter - 1n; exponentIndex++) {
            powerOfTenTerm = (powerOfTenTerm * 10n) % calculationBaseModulus;
        }

        runningTotalModuloBase = (runningTotalModuloBase + (powerOfTenTerm * 7n)) % calculationBaseModulus;

        if (runningTotalModuloBase % targetVal === 0n) {
            return Number(iterationCounter);
        }
    }

    return -1; // Should not be reached under problem constraints for valid inputs
}

const finalOutput = determineRepeatingDigitSequenceLength(designatedDivisor);
console.log(finalOutput);