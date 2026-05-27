function processInput(inputString) {
    const targetNum = Number.parseInt(inputString.trim(), 10);

    if (targetNum === 1) {
        console.log(0);
        return;
    }

    const primeFactorsWithExponents = getPrimeFactorization(targetNum);

    let totalSum = 0;

    function generateDivisors(factorIndex, currentDivisorProduct) {
        if (factorIndex === primeFactorsWithExponents.length) {
            if (targetNum > currentDivisorProduct * (currentDivisorProduct + 1)) {
                totalSum += (targetNum / currentDivisorProduct) - 1;
            }
            return;
        }

        const [primeBase, exponentCount] = primeFactorsWithExponents[factorIndex];
        let currentPower = 1;
        for (let i = 0; i <= exponentCount; i++) {
            generateDivisors(factorIndex + 1, currentDivisorProduct * currentPower);
            currentPower *= primeBase;
        }
    }

    generateDivisors(0, 1);

    console.log(totalSum);
}

function getPrimeFactorization(valueToFactor) {
    const factorList = [];
    let remainingValue = valueToFactor;
    let currentCandidate = 2;

    while (currentCandidate * currentCandidate <= remainingValue) {
        if (remainingValue % currentCandidate === 0) {
            let count = 0;
            while (remainingValue % currentCandidate === 0) {
                count++;
                remainingValue /= currentCandidate;
            }
            factorList.push([currentCandidate, count]);
        }
        currentCandidate++;
    }

    if (remainingValue > 1) {
        factorList.push([remainingValue, 1]);
    }
    return factorList;
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
