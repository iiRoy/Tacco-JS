function processInput(rawData) {
    // Split the raw input data into individual lines.
    const lines = rawData.split('\n');

    // Parse the first line to extract the two numeric values.
    const firstLineParts = lines[0].split(' ');

    // Convert the extracted parts to integers.
    const countVal = parseInt(firstLineParts[0]);
    const productVal = parseInt(firstLineParts[1]);

    // Handle a specific edge case where the count value is 1.
    if (countVal === 1) {
        console.log(countVal); // Output the count value.
        return 0; // Terminate execution.
    }

    // Initialize variables for prime factorization logic.
    // These variables are part of the `calculatePrimeFactors` closure.
    let currentDivisor = 7;
    let divisorStep = 4;

    /**
     * Recursively calculates the prime factors of a given number.
     * This function uses a wheel factorization optimization (2, 3, 5, then 6k +/- 1).
     * @param {number} numberToFactor The number to factorize.
     * @returns {number[]} An array of prime factors.
     */
    const calculatePrimeFactors = (numberToFactor) => {
        // Base cases for small numbers.
        if (numberToFactor < 2) {
            return [];
        }
        if (numberToFactor === 2 || numberToFactor === 3 || numberToFactor === 5) {
            return [numberToFactor];
        }

        // Check for divisibility by 2, 3, and 5.
        if (numberToFactor % 2 === 0) {
            return [2, ...calculatePrimeFactors(numberToFactor / 2)];
        }
        if (numberToFactor % 3 === 0) {
            return [3, ...calculatePrimeFactors(numberToFactor / 3)];
        }
        if (numberToFactor % 5 === 0) {
            return [5, ...calculatePrimeFactors(numberToFactor / 5)];
        }

        // Calculate the upper bound for checking divisors.
        const upperBound = Math.sqrt(numberToFactor);

        // Iterate through potential prime divisors using the 6k +/- 1 pattern.
        while (currentDivisor <= upperBound) {
            if (numberToFactor % currentDivisor === 0) {
                return [currentDivisor, ...calculatePrimeFactors(numberToFactor / currentDivisor)];
            }
            // Update the divisor and step for the next iteration.
            currentDivisor += divisorStep;
            divisorStep = 6 - divisorStep;
        }
        // If no factors found up to the limit, the number itself is prime.
        return [numberToFactor];
    };

    // Obtain the list of prime factors for the product value.
    const factorResults = calculatePrimeFactors(productVal);

    // Create an object to store the frequency of each prime factor.
    const factorFrequencies = {};

    // Populate the frequency map.
    for (let loopIndex = 0; loopIndex < factorResults.length; loopIndex++) {
        const currentFactor = factorResults[loopIndex];
        factorFrequencies[currentFactor] = (factorFrequencies[currentFactor]) ? factorFrequencies[currentFactor] + 1 : 1;
    }

    // Output the 'length' property of the factorFrequencies object.
    // Note: For a plain object, 'length' is typically undefined.
    console.log(factorFrequencies.length);

    // This conditional check will likely evaluate to false as object.length is undefined.
    if (factorFrequencies.length === 0) {
        console.log(productVal);
        return 0;
    }

    // Initialize the variable to store the final computed result.
    let finalResult = 1;

    // Get an array of unique prime factors (keys from the frequency map).
    const factorKeys = Object.keys(factorFrequencies);

    // Iterate through the unique prime factors.
    for (let loopCounter = 0; loopCounter < factorKeys.length; loopCounter++) {
        // Check if the frequency of the current factor meets the count requirement.
        if (parseInt(factorFrequencies[factorKeys[loopCounter]]) >= countVal) {
            // If it does, multiply the final result by this prime factor.
            finalResult = finalResult * parseInt(factorKeys[loopCounter]);
        }
    }

    // Output the final calculated result.
    console.log(finalResult);
}

// Read input from standard input and pass it to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
