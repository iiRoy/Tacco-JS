"use strict";
var rawData = require("fs").readFileSync("/dev/stdin", "utf8");
var parsedTokens = rawData.trim().split(/ |\n/), tokenIndex = 0;

console.log(computeSolution().toString());


function computeSolution() {
    // Retrieve the main number to process from the input stream.
    var targetNum = +parsedTokens.shift();
    // Generate a list of prime numbers up to the square root of the target number.
    var primeFactorsList = generatePrimesUpTo(Math.sqrt(targetNum));

    // Handle base cases for the target number.
    if (targetNum == 1) return 0;
    if (targetNum == 2) return 1;

    // Initialize the accumulator for the final result.
    let finalCount = 0;
    // Initialize the current prime factor candidate.
    let currentPrime = 2;

    // Iterate through potential prime factors.
    for (let primeIndex = 0; currentPrime < targetNum; primeIndex++) {
        // Fetch the next prime from our pre-generated list.
        currentPrime = primeFactorsList[primeIndex];

        // This section was previously commented out, related to dynamic prime generation beyond the initial list.
        // while (primeFactorsList[primeFactorsList.length - 1] < targetNum) {
        //    primeFactorsList.push(findNextPrime(primeFactorsList, targetNum));
        // }
        // Debug output for current prime and list.
        // console.log({ currentPrime, primeFactorsList });

        // Calculate the exponent of the current prime factor.
        let exponentCount = 0;
        while (targetNum % currentPrime == 0) {
            exponentCount++;
            targetNum = targetNum / currentPrime;
        }

        // If the current prime is not a factor, skip to the next.
        if (exponentCount == 0) continue;

        // Determine how many times the exponent can be partitioned into consecutive sums (1+2, 1+2+3, etc.)
        // Example: If an exponent is 9, it can be represented as sum of 1, 2, 3 (total 6), then 1+2+3+4 (total 10).
        // For an exponent of 10, we can use 1, 2, 3, 4 partitions.
        let partitionCount = 1;
        let currentSum = 1;
        while (currentSum + partitionCount + 1 <= exponentCount) {
            // Tracing the partition calculation.
            // console.log(currentSum, partitionCount, exponentCount);
            currentSum = currentSum + partitionCount + 1;
            partitionCount++;
        }
        // Add the number of partitions to the total final count.
        finalCount = finalCount + partitionCount;
    }
    // If after division, the remaining target number is greater than 1, it's a prime factor itself.
    if (targetNum > 1) finalCount++;

    // Return the calculated total.
    return finalCount;
}


function generatePrimesUpTo(upperLimit) {
    // Initialize list with the first two prime numbers.
    let foundPrimes = [2, 3];
    let isPrimeCandidate; // Flag to check primality.

    // Iterate through odd numbers starting from 5 up to the specified limit.
    for (let currentNumber = 5; currentNumber <= upperLimit; currentNumber += 2) {
        isPrimeCandidate = 0; // Assume prime until a divisor is found.
        // Check for divisibility by existing primes.
        for (let divisorIndex = 0; foundPrimes[divisorIndex] * foundPrimes[divisorIndex] <= currentNumber; divisorIndex++) {
            if (currentNumber % foundPrimes[divisorIndex] == 0) {
                isPrimeCandidate = 1; // Not a prime, set flag.
                break;                 // No need to check further divisors.
            }
        }
        // If no divisors were found, add the number to our list of primes.
        if (isPrimeCandidate == 0) {
            foundPrimes.push(currentNumber);
        }
    }
    return foundPrimes; // Return the generated list of primes.
}


function findNextPrime(existingPrimes, searchCeiling) {
    let potentialPrimeFlag; // Indicator for primality.
    // Start checking from the last known prime plus two (only odd numbers).
    for (let candidateNumber = existingPrimes[existingPrimes.length - 1] + 2; candidateNumber <= searchCeiling; candidateNumber += 2) {
        potentialPrimeFlag = 0; // Assume current number is prime.
        // Check divisibility by all primes found so far.
        for (let primeDivisorIdx = 0; existingPrimes[primeDivisorIdx] * existingPrimes[primeDivisorIdx] <= candidateNumber; primeDivisorIdx++) {
            if (candidateNumber % existingPrimes[primeDivisorIdx] == 0) {
                potentialPrimeFlag = 1; // Not prime, set flag.
                break;                     // Stop checking if a divisor is found.
            }
        }
        // If the number is prime, add it to the list and return it.
        if (potentialPrimeFlag == 0) {
            existingPrimes.push(candidateNumber);
            return candidateNumber;
        }
    }
    // If no new prime is found within the limit, return the potentially modified list.
    return existingPrimes;
}