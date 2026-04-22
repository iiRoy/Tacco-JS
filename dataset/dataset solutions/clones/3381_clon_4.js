process.stdin.resume();
process.stdin.setEncoding('utf8');

const obtainPrimeFactors = (targetNumber, currentDivisor = 2, factorCounts = new Map()) => {
    if (targetNumber <= 1) {
        return factorCounts;
    }

    if (currentDivisor * currentDivisor > targetNumber) {
        factorCounts.set(targetNumber, (factorCounts.get(targetNumber) || 0) + 1);
        return factorCounts;
    }

    if (targetNumber % currentDivisor === 0) {
        factorCounts.set(currentDivisor, (factorCounts.get(currentDivisor) || 0) + 1);
        return obtainPrimeFactors(targetNumber / currentDivisor, currentDivisor, factorCounts);
    } else {
        return obtainPrimeFactors(targetNumber, currentDivisor + 1, factorCounts);
    }
};

const calculateProduct = (primeDistribution, requiredPower) => {
    return Array.from(primeDistribution.entries()).reduce((productAccumulator, [basePrime, powerCount]) => {
        const effectivePower = Math.floor(powerCount / requiredPower);
        return productAccumulator * (basePrime ** effectivePower);
    }, 1);
};

const processInputAndDisplayResult = (rawInputContent) => {
    const [targetPower, baseValue] = rawInputContent.split(" ").map(Number);
    const primeBreakdown = obtainPrimeFactors(baseValue);
    const finalOutcome = calculateProduct(primeBreakdown, targetPower);
    console.log(finalOutcome);
};

processInputAndDisplayResult(require("fs").readFileSync("/dev/stdin", "utf8"));