function calculateDivisorCount(inputString) {
    const upperBoundary = Number(inputString);
    const resultModulus = 1000000007;

    const primeTracker = new Array(upperBoundary + 1).fill(true);
    primeTracker[0] = primeTracker[1] = false;

    for (let currentIter = 2; currentIter * currentIter <= upperBoundary; currentIter++) {
        if (primeTracker[currentIter]) {
            for (let multipleIndex = currentIter * currentIter; multipleIndex <= upperBoundary; multipleIndex += currentIter) {
                primeTracker[multipleIndex] = false;
            }
        }
    }

    const primeFactorAggregates = new Map();

    for (let prospectivePrime = 2; prospectivePrime <= upperBoundary; prospectivePrime++) {
        if (primeTracker[prospectivePrime]) {
            let totalOccurrences = 0;
            let currentPowerVal = prospectivePrime;
            while (currentPowerVal <= upperBoundary) {
                totalOccurrences += Math.floor(upperBoundary / currentPowerVal);
                if (currentPowerVal > upperBoundary / prospectivePrime) { // Prevent overflow for next multiplication
                    break;
                }
                currentPowerVal *= prospectivePrime;
            }
            if (totalOccurrences > 0) {
                primeFactorAggregates.set(prospectivePrime, totalOccurrences);
            }
        }
    }

    let finalAccumulatedProduct = 1;
    for (const countValue of primeFactorAggregates.values()) {
        finalAccumulatedProduct = (finalAccumulatedProduct * (countValue + 1)) % resultModulus;
    }

    console.log(finalAccumulatedProduct);
}

calculateDivisorCount(require("fs").readFileSync("/dev/stdin", "utf8"));