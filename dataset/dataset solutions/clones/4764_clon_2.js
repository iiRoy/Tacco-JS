function primeFactorDecomposition(inputNum) {
    // This array will store objects, each representing a prime factor and its exponent.
    let factorList = [];

    // Iterate from 2 up to the square root of the current number.
    // This efficiently finds prime factors.
    for (let divisorCandidate = 2; divisorCandidate * divisorCandidate <= inputNum; divisorCandidate++) {
        let occurrenceCount = 0; // Initialize count for the current prime candidate.

        // While the current number is divisible by the candidate, keep dividing.
        while (inputNum % divisorCandidate === 0) {
            inputNum /= divisorCandidate; // Reduce the number.
            occurrenceCount++;           // Increment the exponent.
        }

        // If the candidate was a factor (i.e., its exponent is greater than 0).
        if (occurrenceCount) {
            // Add the prime factor and its exponent to our list.
            factorList.push({ primeVal: divisorCandidate, expCount: occurrenceCount });
        }
    }

    // If after all divisions, the number is still not 1,
    // it means the remaining 'inputNum' is a prime factor itself.
    if (inputNum !== 1) {
        factorList.push({ primeVal: inputNum, expCount: 1 });
    }

    return factorList; // Return the complete list of prime factors.
}


function executeCalculation(inputString) {
    // Convert the input string to a number, which represents the upper bound N.
    let upperBound = Number(inputString);
    // Define the modulo value for calculations.
    const moduloValue = 10 ** 9 + 7;

    // An object to accumulate the total exponents for each unique prime factor
    // across all numbers from 1 to N.
    let totalExponents = {};

    // Loop through each number from 1 to N.
    for (let currentNumber = 1; currentNumber <= upperBound; currentNumber++) {
        // Get the prime factorization for the current number.
        let currentNumFactors = primeFactorDecomposition(currentNumber);

        // Iterate over each factor found for the current number.
        currentNumFactors.forEach(singleFactor => {
            // If this prime factor is already in our totalExponents object,
            // add its current exponent to the existing total.
            if (totalExponents[singleFactor.primeVal]) {
                totalExponents[singleFactor.primeVal] += singleFactor.expCount;
            } else {
                // Otherwise, initialize its exponent in the totalExponents object.
                totalExponents[singleFactor.primeVal] = singleFactor.expCount;
            }
        });
    }

    // Initialize the final result.
    let finalResult = 1;

    // Iterate over the unique prime factors (keys) accumulated in totalExponents.
    Object.keys(totalExponents).forEach(factorKey => {
        // Apply the formula: (exponent + 1) for each prime factor.
        finalResult *= (totalExponents[factorKey] + 1);
        // Apply modulo to keep the result within bounds.
        finalResult %= moduloValue;
    });

    // Output the final computed result to the console.
    console.log(finalResult);
}

// Read input from standard input and pass it to the main calculation function.
executeCalculation(require("fs").readFileSync("/dev/stdin", "utf8"));
