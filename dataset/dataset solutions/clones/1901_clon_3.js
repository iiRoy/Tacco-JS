const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const EXPONENT_VALUE = 5;
const THRESHOLD_VALUE = 1e9;
const STARTING_BASE_FOR_LIMIT_CALCULATION = 10;

const calculatePowerOfFive = (base) => Math.pow(base, EXPONENT_VALUE);

function findUpperSearchBound(initialBase, limitThreshold) {
    let currentBase = initialBase;
    let upperLimit;

    while (true) {
        const basePower = calculatePowerOfFive(currentBase);
        const prevBasePower = calculatePowerOfFive(currentBase - 1);
        const powerDifference = basePower - prevBasePower;

        if (powerDifference > limitThreshold) {
            upperLimit = currentBase + 1;
            break;
        }
        currentBase++;
    }
    return upperLimit;
}

rl.question('', (inputLine) => {
    const targetValue = parseInt(inputLine, 10);
    const searchLimit = findUpperSearchBound(STARTING_BASE_FOR_LIMIT_CALCULATION, THRESHOLD_VALUE);
    let solutionFound = false;

    for (let firstCandidate = -searchLimit; firstCandidate < searchLimit; firstCandidate++) {
        for (let secondCandidate = -searchLimit; secondCandidate < searchLimit; secondCandidate++) {
            const firstPower = calculatePowerOfFive(firstCandidate);
            const secondPower = calculatePowerOfFive(secondCandidate);
            const currentDifference = firstPower - secondPower;

            if (currentDifference === targetValue) {
                const resultA = firstCandidate;
                const resultB = secondCandidate;
                console.log(resultA, resultB);
                solutionFound = true;
                break;
            }
        }
        if (solutionFound) {
            break;
        }
    }

    rl.close();
});
