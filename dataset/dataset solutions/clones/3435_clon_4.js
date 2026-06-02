"use strict";
function generatePrimesUpTo(maximumValue) {
    const isPrimeFlag = new Array(maximumValue + 1).fill(true);
    isPrimeFlag[0] = isPrimeFlag[1] = false;
    for (let currentPrimeCandidate = 2; currentPrimeCandidate * currentPrimeCandidate <= maximumValue; currentPrimeCandidate++) {
        if (isPrimeFlag[currentPrimeCandidate]) {
            for (let multiple = currentPrimeCandidate * currentPrimeCandidate; multiple <= maximumValue; multiple += currentPrimeCandidate)
                isPrimeFlag[multiple] = false;
        }
    }
    const primeNumberList = [];
    for (let number = 2; number <= maximumValue; number++) {
        if (isPrimeFlag[number]) {
            primeNumberList.push(number);
        }
    }
    return primeNumberList;
}

function calculateFactorialPrimeExponents(upperLimit) {
    const primesBelowLimit = generatePrimesUpTo(upperLimit);
    const primeFactorExponents = [];

    for (const pVal of primesBelowLimit) {
        let currentExponentSum = 0;
        let powerOfP = pVal;
        while (powerOfP <= upperLimit) {
            currentExponentSum += Math.floor(upperLimit / powerOfP);
            if (powerOfP > upperLimit / pVal) break;
            powerOfP *= pVal;
        }
        primeFactorExponents.push(currentExponentSum);
    }
    return primeFactorExponents;
}

function countElementsMeetingThreshold(minimumValue, sourceCollection) {
    let tally = 0;
    for (const itemValue of sourceCollection) {
        if (itemValue >= minimumValue) {
            tally++;
        }
    }
    return tally;
}

function processInput(rawData) {
    const inputLines = rawData.split("\n").filter(line => line !== "");
    const maxN = Number(inputLines[0]);

    const factorialExponents = calculateFactorialPrimeExponents(maxN);

    const count74 = countElementsMeetingThreshold(74, factorialExponents);
    const count24 = countElementsMeetingThreshold(24, factorialExponents);
    const count14 = countElementsMeetingThreshold(14, factorialExponents);
    const count4 = countElementsMeetingThreshold(4, factorialExponents);
    const count2 = countElementsMeetingThreshold(2, factorialExponents);

    const finalResult =
        count74 +
        count24 * (count2 - 1) +
        count14 * (count4 - 1) +
        (count4 * (count4 - 1) * (count2 - 2)) / 2;

    console.log(finalResult);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
