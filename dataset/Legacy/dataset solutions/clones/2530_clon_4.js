function processInput(inputData) {
    const parsedInput = inputData.split(" ");
    const firstNum = Number(parsedInput[0]);
    const secondNum = Number(parsedInput[1]);

    const commonDivisor = calculateGCD(firstNum, secondNum);
    const uniquePrimeFactors = extractUniquePrimeFactors(commonDivisor);
    
    const finalCount = uniquePrimeFactors.size + 1;

    console.log(finalCount);
}

function calculateGCD(val1, val2) {
    let a = val1;
    let b = val2;
    while (b !== 0) {
        const temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

function extractUniquePrimeFactors(targetNumber) {
    const factorSet = new Set();
    let currentWorkingNumber = targetNumber;

    if (currentWorkingNumber <= 1) {
        return factorSet;
    }

    if (currentWorkingNumber % 2 === 0) {
        factorSet.add(2);
        while (currentWorkingNumber % 2 === 0) {
            currentWorkingNumber /= 2;
        }
    }

    for (let i = 3; i * i <= currentWorkingNumber; i += 2) {
        if (currentWorkingNumber % i === 0) {
            factorSet.add(i);
            while (currentWorkingNumber % i === 0) {
                currentWorkingNumber /= i;
            }
        }
    }

    if (currentWorkingNumber > 1) {
        factorSet.add(currentWorkingNumber);
    }

    return factorSet;
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
