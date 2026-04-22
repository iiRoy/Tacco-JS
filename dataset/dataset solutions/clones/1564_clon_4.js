function executeRoutine(dataStream) {
    const maximumValueConsidered = 1000001; // Corresponds to the maximum possible number value + 1

    // A utility function to compute the greatest common divisor iteratively
    function obtainCommonDivisor(firstOperand, secondOperand) {
        while (secondOperand) {
            let transientValue = secondOperand;
            secondOperand = firstOperand % secondOperand;
            firstOperand = transientValue;
        }
        return firstOperand;
    }

    // Input processing: split into lines, then parse numbers
    let lines = dataStream.split("\n");
    let sequenceLength = Number(lines[0]); // The first line is N, though not directly used beyond parsing
    let numericalCollection = lines[1].split(" ").map(Number); // The second line contains the array of numbers

    // Phase 1: Check if the entire collection is "not coprime" (i.e., their overall GCD is > 1)
    let overallCommonDivisor = numericalCollection.reduce(obtainCommonDivisor);
    if (overallCommonDivisor !== 1) {
        console.log("not coprime");
        return;
    }

    // Phase 2: Precompute Smallest Prime Factor (SPF) for all numbers up to maximumValueConsidered
    // This allows efficient factorization later.
    let smallestPrimeDivisor = Array(maximumValueConsidered).fill(0);
    let primeNumbersList = [];

    for (let currentNum = 2; currentNum < maximumValueConsidered; currentNum++) {
        if (smallestPrimeDivisor[currentNum] === 0) { // If currentNum hasn't been marked, it's prime
            smallestPrimeDivisor[currentNum] = currentNum;
            primeNumbersList.push(currentNum);
        }
        // Mark multiples of currentNum with their smallest prime factor
        for (let p of primeNumbersList) {
            // Optimization: If p is greater than the smallest prime factor of currentNum,
            // or if currentNum * p exceeds the limit, break.
            if (p > smallestPrimeDivisor[currentNum] || currentNum * p >= maximumValueConsidered) {
                break;
            }
            smallestPrimeDivisor[currentNum * p] = p;
        }
    }

    // Phase 3: Check for pairwise coprimality using prime factor analysis
    let encounteredDistinctPrimes = new Map(); // Stores prime factor -> count of numbers it divides
    let numbersAlreadyProcessed = new Set();    // Tracks if a number has appeared multiple times

    for (let value of numericalCollection) {
        if (value === 1) {
            continue; // Number 1 does not affect coprimality
        }

        // If a number appears more than once, they cannot be pairwise coprime
        if (numbersAlreadyProcessed.has(value)) {
            console.log("setwise coprime");
            return;
        }
        numbersAlreadyProcessed.add(value);

        let tempValueForFactoring = value;
        let distinctFactorsForCurrentValue = new Set(); // Store unique prime factors for the current number

        // Factorize tempValueForFactoring using the precomputed SPF array
        while (tempValueForFactoring > 1) {
            let factor = smallestPrimeDivisor[tempValueForFactoring];
            distinctFactorsForCurrentValue.add(factor);
            // Divide out all occurrences of this prime factor
            while (tempValueForFactoring % factor === 0) {
                tempValueForFactoring /= factor;
            }
        }

        // For each unique prime factor of the current number
        for (let primeFactor of distinctFactorsForCurrentValue) {
            // Increment its count across all processed numbers
            encounteredDistinctPrimes.set(primeFactor, (encounteredDistinctPrimes.get(primeFactor) || 0) + 1);
            // If a prime factor is shared by more than one number, they are not pairwise coprime
            if (encounteredDistinctPrimes.get(primeFactor) > 1) {
                console.log("setwise coprime");
                return;
            }
        }
    }

    // If all checks pass, the numbers are pairwise coprime
    console.log("pairwise coprime");
}

// Standard competitive programming entry point for Node.js
executeRoutine(require("fs").readFileSync("/dev/stdin", "utf8"));