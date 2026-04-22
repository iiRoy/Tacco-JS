const primeFinderAlgorithm = (upperLimit) => {
    // Array to mark numbers as composite (true) or potentially prime (false)
    let isComposite = (new Array(upperLimit + 1)).fill(false);

    let foundPrimes = []; // List to store all identified prime numbers

    for (let currentNum = 2; currentNum * currentNum <= upperLimit; currentNum++) {
        if (!isComposite[currentNum]) { // If the current number is prime
            foundPrimes.push(currentNum); // Add it to our list of primes

            // Mark all multiples of this prime as composite
            for (let multipleNum = currentNum * currentNum; multipleNum <= upperLimit; multipleNum += currentNum) {
                isComposite[multipleNum] = true;
            }
        }
    }

    // Add any remaining unmarked numbers greater than sqrt(upperLimit) that are primes
    for (let currentNum = Math.floor(Math.sqrt(upperLimit)) + 1; currentNum <= upperLimit; currentNum++) {
        if (!isComposite[currentNum]) {
            foundPrimes.push(currentNum);
        }
    }


    return foundPrimes; // Return the full list of primes up to the limit
};


const decomposeIntoPrimes = (targetNumber, primeList) => {
    let primeComponentCounts = {}; // Object to store prime factors and their respective counts

    // Iterate through the provided list of primes
    primeList.some(currentPrime => {
        if (targetNumber < currentPrime) {
            return true; // Optimization: If targetNumber is smaller than currentPrime, no further primes will divide it
        }

        // While the current prime divides the target number
        while (targetNumber % currentPrime === 0) {
            // Increment the count for this prime factor
            if (!primeComponentCounts[currentPrime]) {
                primeComponentCounts[currentPrime] = 1;
            } else {
                primeComponentCounts[currentPrime]++;
            }
            targetNumber /= currentPrime; // Reduce the target number
        }
    });

    // If after division, the target number is still greater than 1, it means the remaining number is a prime factor itself
    if (targetNumber > 1) {
        primeComponentCounts[targetNumber] = 1;
    }

    return primeComponentCounts; // Return the map of prime factors and their powers
};


const calculateDivisor = (firstVal, secondVal) => {
    // Base case for the Euclidean algorithm
    if (secondVal === 0) {
        return firstVal;
    }
    // Recursive call to find the greatest common divisor
    return calculateDivisor(secondVal, firstVal % secondVal);
};


const processInputData = (inputString) => {
    const lines = inputString.split("\n");
    const elementCount = Number(lines[0]); // First line contains the count of numbers
    const numberSequence = lines[1].split(" ").map(Number); // Second line contains the space-separated numbers

    // Generate primes up to the maximum value present in the input sequence
    const computedPrimes = primeFinderAlgorithm(Math.max(...numberSequence));

    // A map to track which prime factors have been encountered across all numbers
    let factorPresenceMap = (new Array(Math.max(...numberSequence) + 1)).fill(false);
    let areElementsPairwiseCoprime = true; // Flag to check for pairwise coprimality

    for (let idx = 0; idx < elementCount; idx++) {
        // Obtain prime factors for the current number in the sequence
        const individualFactors = Object.keys(decomposeIntoPrimes(numberSequence[idx], computedPrimes));

        for (let factorIdx = 0; factorIdx < individualFactors.length; factorIdx++) {
            const currentFactor = Number(individualFactors[factorIdx]);

            // Check if this prime factor has already been seen in previous numbers
            if (factorPresenceMap[currentFactor] === true) {
                areElementsPairwiseCoprime = false; // If so, they are not pairwise coprime
                break; // No need to check further factors for this number
            }
            factorPresenceMap[currentFactor] = true; // Mark this prime factor as seen
        }
        if (!areElementsPairwiseCoprime) {
            break; // If not pairwise coprime, no need to check further numbers
        }
    }

    if (areElementsPairwiseCoprime) {
        console.log("pairwise coprime");
        return; // Exit if pairwise coprime
    }

    // If not pairwise coprime, check for setwise coprimality
    // Calculate the greatest common divisor for the entire set of numbers
    let overallDivisor = numberSequence[0];
    for (let idx = 1; idx < numberSequence.length; idx++) {
        overallDivisor = calculateDivisor(overallDivisor, numberSequence[idx]);
    }

    if (overallDivisor === 1) {
        console.log("setwise coprime");
        return; // Exit if setwise coprime
    }

    // If neither of the above conditions is met
    console.log("not coprime");
};


// Read input from standard input and pass it to the main processing function
const filesystemModule = require("fs");
processInputData(filesystemModule.readFileSync("/dev/stdin", "utf8"));