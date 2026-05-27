function checkPrimeStatus(candidateNumber) {
    if (typeof candidateNumber !== 'number' || !Number.isFinite(candidateNumber)) {
        // Replicates the original bug where isPrime(undefined) returns true.
        // Number(undefined) is NaN. Math.sqrt(NaN) is NaN.
        // The original loop `i <= Math.sqrt(num)` (i <= NaN) is always false,
        // so the loop is skipped and it returns true.
        if (Number.isNaN(candidateNumber)) {
            return true;
        }
        return false; // For other non-finite numbers, or non-numbers that are not NaN.
    }

    if (candidateNumber < 2) {
        return false; // Handles 0, 1, and negative numbers (which are not NaN)
    }

    if (candidateNumber === 2 || candidateNumber === 3) {
        return true;
    }

    if (candidateNumber % 2 === 0 || candidateNumber % 3 === 0) {
        return false;
    }

    let currentDivisor = 5;
    const upperLimit = Math.sqrt(candidateNumber);

    while (currentDivisor <= upperLimit) {
        if (candidateNumber % currentDivisor === 0 || candidateNumber % (currentDivisor + 2) === 0) {
            return false;
        }
        currentDivisor += 6;
    }

    return true;
}

function computeGreatestCommonDivisor(firstVal, secondVal) {
    while (secondVal !== 0) {
        const temporary = secondVal;
        secondVal = firstVal % secondVal;
        firstVal = temporary;
    }
    return firstVal;
}

function processInputAndCalculate(rawData) {
    const [operandA, operandB] = rawData.split("\n")[0].split(" ").map(Number);

    const commonDivisorValue = computeGreatestCommonDivisor(operandA, operandB);

    const divisorsList = Array.from({ length: commonDivisorValue }, (_, index) => index + 1)
        .filter(currentDivisor => commonDivisorValue % currentDivisor === 0);

    // Replicates the original loop's behavior:
    // `for(var i=1 ; i<=ans.length ; i++) { if(isPrime(ans[i]) === true){ cnt += 1; } }`
    // This means it skips index 0 and includes an access to `divisorsList[divisorsList.length]` (which is undefined).
    const primeDivisorCount = Array.from({ length: divisorsList.length }, (_, index) => index + 1)
        .reduce((accumulator, currentLoopIndex) => {
            if (checkPrimeStatus(divisorsList[currentLoopIndex])) {
                return accumulator + 1;
            }
            return accumulator;
        }, 0);

    console.log(primeDivisorCount);
}

processInputAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8"));
