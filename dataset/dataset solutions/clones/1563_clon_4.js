const collectPrimesUpToSquareRoot = (limitValue) => {
    const compositeTracker = new Array(limitValue + 1).fill(false); // `false` indicates a potential prime
    const smallPrimeCollection = [];

    for (let currentNumber = 2; currentNumber * currentNumber <= limitValue; currentNumber++) {
        if (!compositeTracker[currentNumber]) { // If currentNumber is not marked as composite
            smallPrimeCollection.push(currentNumber); // Add it to the list of small primes
            // Mark all multiples of this prime as composite, starting from its square
            for (let multiple = currentNumber * currentNumber; multiple <= limitValue; multiple += currentNumber) {
                compositeTracker[multiple] = true;
            }
        }
    }
    return smallPrimeCollection; // Returns primes up to sqrt(limitValue)
};

const extractSpecificDivisors = (targetNumber, primeCandidatesList) => {
    const foundDivisors = new Set(); // Utilizes a Set for automatic uniqueness

    for (const potentialPrime of primeCandidatesList) {
        // Stop iterating if the target number is smaller than the current potential prime
        if (targetNumber < potentialPrime) {
            break;
        }
        // If the potential prime divides the target number, add it to the collection
        if (targetNumber % potentialPrime === 0) {
            foundDivisors.add(potentialPrime);
        }
    }

    // As per original logic, if the target number itself is still greater than 1
    // after checking against the primeCandidatesList, add it as a divisor.
    if (targetNumber > 1) {
        foundDivisors.add(targetNumber);
    }
    return Array.from(foundDivisors); // Convert the Set to an Array
};

const calculateGreatestCommonDivisor = (firstValue, secondValue) => {
    // Handle cases where one or both inputs are zero
    if (firstValue === 0) return secondValue;
    if (secondValue === 0) return firstValue;

    // Iterative Euclidean algorithm
    let currentA = firstValue;
    let currentB = secondValue;
    while (currentB !== 0) {
        const remainder = currentA % currentB;
        currentA = currentB;
        currentB = remainder;
    }
    return currentA;
};

const determineCoprimalityStatus = (rawInputContent) => {
    const inputLines = rawInputContent.split("\n");
    const elementCount = Number(inputLines[0]);
    const numberArray = inputLines[1].split(" ").map(Number);

    const upperLimitForPrimes = 1000001; // Corresponds to MAX_A in original

    // Obtain primes up to sqrt(upperLimitForPrimes) based on original Sieve's behavior
    const relevantPrimes = collectPrimesUpToSquareRoot(upperLimitForPrimes);

    // Phase 1: Check for pairwise coprimality
    const globalDivisorRegistry = new Set(); // Stores all unique divisors encountered so far
    let isPairwise = true;

    for (const currentElement of numberArray) {
        // Get the specific divisors for the current number
        const elementDivisors = extractSpecificDivisors(currentElement, relevantPrimes);

        // Iterate through the divisors of the current element
        for (const divisorEntry of elementDivisors) {
            if (globalDivisorRegistry.has(divisorEntry)) {
                isPairwise = false; // Found a common divisor, not pairwise coprime
                break; // Exit inner loop
            }
            globalDivisorRegistry.add(divisorEntry); // Add the divisor to the global registry
        }
        if (!isPairwise) {
            break; // Exit outer loop if already determined not pairwise coprime
        }
    }

    if (isPairwise) {
        console.log("pairwise coprime");
        return;
    }

    // Phase 2: If not pairwise coprime, check for setwise coprimality
    // Compute the GCD of all numbers in the array using Array.prototype.reduce
    const overallGCDResult = numberArray.reduce((accumulator, currentValue) =>
        calculateGreatestCommonDivisor(accumulator, currentValue)
    );

    if (overallGCDResult === 1) {
        console.log("setwise coprime");
        return;
    }

    // Phase 3: If neither pairwise nor setwise coprime
    console.log("not coprime");
};

determineCoprimalityStatus(require("fs").readFileSync("/dev/stdin", "utf8"));
