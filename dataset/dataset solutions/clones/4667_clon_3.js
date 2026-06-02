function logOutput(message) {
    console.log(message);
}

function processInput(rawInputString) {
    const parsedValue = parseInt(rawInputString, 10);

    if (parsedValue === 1) {
        logOutput("1");
        return;
    }

    const allDivisors = findSortedDivisors(parsedValue);

    let minimumCombinedDigitCount = 20;

    for (let idx = 0; idx < allDivisors.length / 2; idx++) {
        const factorA = allDivisors[idx];
        const factorB = allDivisors[allDivisors.length - 1 - idx];

        const currentPairDigitCount = calculateMaxDigitCount(factorA, factorB);

        minimumCombinedDigitCount = Math.min(minimumCombinedDigitCount, currentPairDigitCount);
    }

    logOutput(minimumCombinedDigitCount);
}

function calculateMaxDigitCount(numberOne, numberTwo) {
    const lengthOne = `${numberOne}`.length;
    const lengthTwo = `${numberTwo}`.length;

    return Math.max(lengthOne, lengthTwo);
}

function findSortedDivisors(targetNum) {
    const foundDivisors = [];
    let currentCandidate = 1;

    while (currentCandidate * currentCandidate <= targetNum) {
        if (targetNum % currentCandidate === 0) {
            foundDivisors.push(currentCandidate);

            const complementaryDivisor = targetNum / currentCandidate;
            if (currentCandidate * currentCandidate !== targetNum) {
                foundDivisors.push(complementaryDivisor);
            }
        }
        currentCandidate++;
    }

    foundDivisors.sort((a, b) => a - b);

    return foundDivisors;
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
