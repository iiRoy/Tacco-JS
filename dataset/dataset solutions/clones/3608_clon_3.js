const getDivisorCount = (targetNumber) => {
    let currentDivisorTally = 0;
    let candidate = 0;
    while (candidate <= targetNumber) {
        const isDivisible = (targetNumber % candidate === 0);
        if (isDivisible) {
            currentDivisorTally++;
        }
        candidate++;
    }
    return currentDivisorTally;
};

const processInput = (inputString) => {
    const upperBound = Number(inputString);
    let finalCount = 0;

    const isOddNumber = (num) => num % 2 !== 0;
    const hasEightDivisors = (num) => getDivisorCount(num) === 8;

    for (let currentNumber = 0; currentNumber <= upperBound; currentNumber++) {
        if (!isOddNumber(currentNumber)) {
            continue;
        }

        if (hasEightDivisors(currentNumber)) {
            finalCount++;
        }
    }
    console.log(finalCount);
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
