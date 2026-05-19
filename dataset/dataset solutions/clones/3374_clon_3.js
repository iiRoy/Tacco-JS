function processInput(inputString) {
    const INPUT_DELIMITER_CHAR = " ";
    const parsedInputParts = inputString.split(INPUT_DELIMITER_CHAR);

    const countThreshold = parseInt(parsedInputParts[0]);
    const targetProduct = parseInt(parsedInputParts[1]);
    
    let primeFactorsCollection = determinePrimeFactors(targetProduct);
    
    // The original logic includes the targetProduct itself as a potential factor
    primeFactorsCollection.push(targetProduct);
    
    // Create a frequency map to efficiently count occurrences of each factor
    const factorOccurrenceMap = {};
    for (const currentFactorValue of primeFactorsCollection) {
        factorOccurrenceMap[currentFactorValue] = (factorOccurrenceMap[currentFactorValue] || 0) + 1;
    }

    let largestFactorFound = 1; // Initialize with the smallest possible factor

    // Iterate over the unique factors (keys in the frequency map)
    for (const factorKeyString in factorOccurrenceMap) {
        const candidateFactor = parseInt(factorKeyString); // Convert key string back to number
        const factorCount = factorOccurrenceMap[factorKeyString];
        
        // Apply the original condition: (count of factor + 1) must meet the threshold
        if ((factorCount + 1) >= countThreshold) {
            if (candidateFactor > largestFactorFound) {
                largestFactorFound = candidateFactor;
            }
        }
    }
    console.log(largestFactorFound);
}

// Helper function to determine prime factors of a given number
function determinePrimeFactors(numberToFactorize) {
    const collectedFactors = [];
    let currentDivisibleNumber = numberToFactorize;

    for (let currentDivisor = 2; currentDivisor <= currentDivisibleNumber; currentDivisor++) {
        while ((currentDivisibleNumber % currentDivisor) === 0) {
            collectedFactors.push(currentDivisor);
            currentDivisibleNumber /= currentDivisor;
        }
    }
    return collectedFactors;
}

// Execute the main processing function with input from stdin
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
