function calculateDivisibilityByTwo(valueToExamine) {
    let divisionCount = 0;
    let workingValue = valueToExamine;

    if (workingValue <= 0) {
        return 0;
    }

    while (workingValue % 2 === 0) {
        divisionCount++;
        workingValue /= 2;
    }
    return divisionCount;
}

function processInput(rawData) {
    const limitValue = Number(rawData);

    let maxDivisibleByTwoInfo = [1, 0];

    for (let currentNumber = 1; currentNumber <= limitValue; currentNumber++) {
        const currentDivisibilityCount = calculateDivisibilityByTwo(currentNumber);

        const existingMaxCount = maxDivisibleByTwoInfo[1];
        if (currentDivisibilityCount > existingMaxCount) {
            maxDivisibleByTwoInfo = [currentNumber, currentDivisibilityCount];
        }
    }

    console.log(maxDivisibleByTwoInfo[0]);
}

const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
processInput(fileContent);
