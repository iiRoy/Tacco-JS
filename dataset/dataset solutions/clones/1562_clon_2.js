const PrimeSieveGenerator = (limitVal) => {
    // Initialize an array to track numbers that have been sieved
    let markedStatus = (new Array(limitVal)).fill(0);
    // This array will store the prime numbers found
    let primeNumbersList = [];

    // Iterate from 2 up to the square root of the limit
    for (let idx = 2; idx * idx <= limitVal; idx++) {
        // If the current number hasn't been marked (i.e., it's prime)
        if (!markedStatus[idx]) {
            // Add it to our list of primes
            primeNumbersList.push(idx);
            // Mark all its multiples as not prime
            for (let mult = idx; mult * mult <= limitVal; mult += idx) {
                markedStatus[mult] = 1; // Mark as sieved
            }
        }
    }
    // Return the collected prime numbers
    return primeNumbersList;
};

const FactorizeWithPrimes = (targetNum, primeCollection) => {
    // Object to store the prime factors and their counts
    let primeFactorCounts = {};

    // Iterate through the provided prime numbers
    primeCollection.some(currentPrime => {
        // If the target number becomes smaller than the current prime,
        // no further primes in the list can be factors.
        if (targetNum < currentPrime) return true;

        // While the current prime divides the target number
        while (targetNum % currentPrime === 0) {
            // Increment its count in the factors object
            if (!primeFactorCounts[currentPrime]) {
                primeFactorCounts[currentPrime] = 1;
            } else {
                primeFactorCounts[currentPrime]++;
            }
            // Divide the target number by the prime
            targetNum /= currentPrime;
        }
    });

    // If after all divisions, the target number is still greater than 1,
    // it means the remaining number is a prime factor itself.
    if (targetNum > 1) {
        primeFactorCounts[targetNum] = 1;
    }
    // Return the object containing prime factors and their exponents
    return primeFactorCounts;
};


const CalculateGreatestCommonDivisor = (valA, valB) => {
    // Base case: if valB is zero, valA is the GCD
    if (valB === 0) return valA;
    // Base case: if valA is zero, valB is the GCD
    else if (valA === 0) return valB;
    // Recursive step: use Euclidean algorithm
    return CalculateGreatestCommonDivisor(valB, valA % valB);
};

const ExecuteMainLogic = (inputData) => {
    // Parse the number of elements from the first line of input
    const countElements = Number(inputData.split("\n")[0]);
    // Parse the array of numbers from the second line of input
    const inputArray = inputData.split("\n")[1].split(" ").map(Number);

    // Define a maximum value for the sieve, slightly larger than 10^6
    const maximumValueLimit = 10 ** 6 + 1;

    // Generate primes up to maximumValueLimit using the Sieve of Eratosthenes
    const generatedPrimes = PrimeSieveGenerator(maximumValueLimit);

    // Initialize an array to track the presence of prime factors
    let factorPresenceTracker = [...new Array(maximumValueLimit)].fill(0);
    // Flag to determine if the numbers are pairwise coprime
    let arePairwiseCoprime = true;

    // Iterate through each number in the input array
    for (let idx = 0; idx < countElements; idx++) {
        // Get the prime factors of the current number
        const currentNumFactors = Object.keys(FactorizeWithPrimes(inputArray[idx], generatedPrimes));

        // Iterate through each prime factor found
        for (let factorIdx = 0; factorIdx < currentNumFactors.length; factorIdx++) {
            // If this prime factor has already been seen in a previous number
            if (factorPresenceTracker[currentNumFactors[factorIdx]] === 1) {
                arePairwiseCoprime = false; // They are not pairwise coprime
            }
            // Mark this prime factor as seen
            factorPresenceTracker[currentNumFactors[factorIdx]] = 1;
        }
    }

    // If the flag is still true, all numbers are pairwise coprime
    if (arePairwiseCoprime) {
        console.log("pairwise coprime");
        return;
    }

    // If not pairwise coprime, check for setwise coprime
    // Calculate the greatest common divisor of all numbers in the array
    let overallGCD = 0;
    for (let idx = 0; idx < inputArray.length; idx++) {
        overallGCD = CalculateGreatestCommonDivisor(overallGCD, inputArray[idx]);
    }

    // If the overall GCD is 1, they are setwise coprime
    if (overallGCD === 1) {
        console.log("setwise coprime");
        return;
    }

    // If neither pairwise nor setwise coprime
    console.log("not coprime");
};

// Read input from stdin and execute the main logic
ExecuteMainLogic(require("fs").readFileSync("/dev/stdin", "utf8"));
