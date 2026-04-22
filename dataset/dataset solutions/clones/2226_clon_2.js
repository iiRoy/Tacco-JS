function ProcessInput(rawData) {
    // Split the entire input string into individual lines
    // based on the newline character.
    let lines = rawData.split("\n");

    // The first line contains the total number of entries.
    let countOfNumbers = parseInt(lines[0], 10);

    // The second line contains space-separated numbers,
    // which are stored as strings initially.
    let initialNumbers = lines[1].split(' ');

    // This 2D array will store the counts of each prime factor
    // for every initial number.
    let primeFactorCounts = new Array(countOfNumbers);

    // A temporary string to collect all unique prime factors found
    // across all input numbers. Factors will be comma-separated.
    let uniqueFactorsString = '';

    // This array will store the last prime factor that reduced a number to 1.
    // Its actual usage later seems limited, but its declaration is maintained.
    let lastFactorReached = new Array(countOfNumbers);

    // This 2D array stores the "required" power for each prime factor
    // for each number, derived from comparisons with other numbers.
    let requiredFactorPowers = new Array(countOfNumbers);

    // This array will hold the final calculated value for each
    // of the 'countOfNumbers' input entries.
    let resultValues = new Array(countOfNumbers);

    // --- Phase 1: Prime Factorization and Unique Factor Collection ---
    // Iterate through each number provided in the input.
    for (let numberIndex = 0; numberIndex < countOfNumbers; numberIndex++) {
        // Convert the current number string to an integer.
        initialNumbers[numberIndex] = parseInt(initialNumbers[numberIndex], 10);

        // Initialize the inner arrays for factor counts and required powers.
        // The size 1000001 suggests handling factors up to 1,000,000.
        primeFactorCounts[numberIndex] = new Array(1000001);
        requiredFactorPowers[numberIndex] = new Array(1000001);

        // Initialize all elements of the newly created inner arrays to zero.
        // This ensures a clean slate for factor counting.
        for (let divisorCandidate = 2; divisorCandidate < 1000001; divisorCandidate++) {
            requiredFactorPowers[numberIndex][divisorCandidate] = 0;
            primeFactorCounts[numberIndex][divisorCandidate] = 0;
        }

        // Perform prime factorization for the current number.
        // We check for divisibility by potential prime factors starting from 2.
        for (let currentDivisor = 2; currentDivisor < 1000001; currentDivisor++) {
            // Re-initialization for prime factor counts and required powers for the current divisor.
            // This is somewhat redundant given the previous loop, but maintains structural integrity.
            primeFactorCounts[numberIndex][currentDivisor] = 0;
            requiredFactorPowers[numberIndex][currentDivisor] = 0;

            // Repeatedly divide the number by 'currentDivisor' as long as it's divisible.
            // This counts how many times 'currentDivisor' is a factor.
            for (let innerLoopControl = 0; innerLoopControl >= 0; innerLoopControl) { // Acts as a while(true) loop
                if (initialNumbers[numberIndex] % currentDivisor === 0) {
                    primeFactorCounts[numberIndex][currentDivisor]++; // Increment the count for this factor.
                    initialNumbers[numberIndex] /= currentDivisor;     // Reduce the number.
                    // If this divisor hasn't been added to our unique factors list yet, add it.
                    if (uniqueFactorsString.indexOf(currentDivisor) === -1) {
                        uniqueFactorsString += currentDivisor + ',';
                    }
                } else {
                    // If not divisible, break out of this inner loop and try the next 'currentDivisor'.
                    break;
                }
            }
            // If the number has been completely factorized (reduced to 1),
            // record the last factor and move to the next initial number.
            if (initialNumbers[numberIndex] === 1) {
                lastFactorReached[numberIndex] = currentDivisor;
                break; // Exit the 'currentDivisor' loop for this 'numberIndex'.
            }
        }
    }

    // --- Phase 2: Process Unique Factors ---
    // Remove the trailing comma from the string of unique factors.
    uniqueFactorsString = uniqueFactorsString.slice(0, -1);

    // Split the unique factors string into an array of strings.
    let distinctFactors = uniqueFactorsString.split(',');

    // Get the total count of distinct prime factors identified.
    let numDistinctFactors = distinctFactors.length;

    // Convert the string representations of distinct factors to integers.
    for (let distinctFactorIndex = 0; distinctFactorIndex < numDistinctFactors; distinctFactorIndex++) {
        distinctFactors[distinctFactorIndex] = parseInt(distinctFactors[distinctFactorIndex], 10);
    }

    // --- Phase 3: Calculate Required Factor Powers ---
    // This complex loop determines the minimum required powers for each prime factor
    // for each number, such that it "covers" the factor counts of other numbers.
    for (let targetNumberIdentifier = 0; targetNumberIdentifier < countOfNumbers; targetNumberIdentifier++) {
        for (let factorLookupIndex = 0; factorLookupIndex < numDistinctFactors; factorLookupIndex++) {
            // Get the actual prime factor value from the distinctFactors array.
            let currentFactorValue = distinctFactors[factorLookupIndex];
            for (let comparatorNumberIdentifier = 0; comparatorNumberIdentifier < countOfNumbers; comparatorNumberIdentifier++) {
                // Only compare if the target number and comparator number are different.
                if (targetNumberIdentifier !== comparatorNumberIdentifier) {
                    // Calculate a 'deficit': how much more of the current factor the comparator number has
                    // compared to the target number's own count plus what's already accumulated.
                    let calculatedDifference = primeFactorCounts[comparatorNumberIdentifier][currentFactorValue] -
                                             primeFactorCounts[targetNumberIdentifier][currentFactorValue] -
                                             requiredFactorPowers[targetNumberIdentifier][currentFactorValue];

                    // If a positive difference exists, it means the target number needs
                    // to increase its required power for this factor.
                    if (calculatedDifference > 0) {
                        requiredFactorPowers[targetNumberIdentifier][currentFactorValue] += calculatedDifference;
                    }
                }
            }
        }
    }

    // --- Phase 4: Final Result Calculation ---
    // Initialize a variable to accumulate the sum of all individual results.
    let totalSumOfResults = 0;

    // Calculate the final value for each number based on its required factor powers.
    for (let finalNumberIdentifier = 0; finalNumberIdentifier < countOfNumbers; finalNumberIdentifier++) {
        resultValues[finalNumberIdentifier] = 1; // Start with 1 for multiplication.

        // For each distinct factor, multiply the result by the factor raised to its required power.
        for (let factorIteration = 0; factorIteration < numDistinctFactors; factorIteration++) {
            let actualFactor = distinctFactors[factorIteration];
            if (requiredFactorPowers[finalNumberIdentifier][actualFactor] > 0) {
                resultValues[finalNumberIdentifier] *= Math.pow(actualFactor, requiredFactorPowers[finalNumberIdentifier][actualFactor]);
            }
        }
        totalSumOfResults += resultValues[finalNumberIdentifier]; // Add this number's result to the grand total.
    }

    // Output the final sum modulo (10^9 + 7).
    // This is a common practice in competitive programming to handle large numbers.
    console.log(totalSumOfResults % (Math.pow(10, 9) + 7));
}

// Entry point: Read input from standard input and pass it to the processing function.
// This setup is typical for JavaScript execution in environments like Node.js for competitive programming.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));