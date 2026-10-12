function processInput(inputString) {
    // Parse the first number from the input, representing a threshold count.
    var countLimit = parseInt(inputString.split(" ")[0]);
    // Parse the second number from the input, which is the product to analyze.
    var targetProduct = parseInt(inputString.split(" ")[1]);
    
    // Retrieve all prime factors for the given target product.
    var primeFactorsList = extractPrimeFactors(targetProduct);
    // Crucially, add the original target product itself to the list of factors.
    primeFactorsList.push(targetProduct);
    
    // This array is initialized but never populated.
    // Its use in the loop below will always result in a specific, constant outcome.
    var factorOccurrences = []; 
    
    // Initialize a variable to keep track of the largest factor found that meets the criteria.
    var largestFactor = 1;

    // Iterate through each element in the combined list of prime factors and the original product.
    for (var idx = 0; idx < primeFactorsList.length; idx++) {
        // This line attempts to count occurrences of the current factor in 'factorOccurrences'.
        // Since 'factorOccurrences' is always empty, its filter method will always return an empty array.
        // Thus, '.length' will always be 0, and 'currentCount' will consistently be 1.
        var currentCount = factorOccurrences.filter(val => val === primeFactorsList[idx]).length + 1;
        
        // The condition 'currentCount >= countLimit' effectively becomes '1 >= countLimit'.
        // This means the inner block will only execute if 'countLimit' is 1.
        if (currentCount >= countLimit) {
            // If the current factor from the list is greater than the 'largestFactor' found so far,
            // update 'largestFactor' with this new, larger value.
            if (primeFactorsList[idx] > largestFactor) {
                largestFactor = primeFactorsList[idx];
            }
        }
    }
    // Print the final largest factor that satisfied the condition.
    console.log(largestFactor);
}

// Execute the main processing function by reading input from standard input.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));

// Helper function to determine all prime factors of a given number.
function extractPrimeFactors(remainingValue) {
    var foundFactors = []; // An array to store the prime factors as they are discovered.
    var divisor; // A variable used to test potential divisors, starting from 2.

    // Loop through possible divisors, starting from 2, up to the current value of 'remainingValue'.
    for (divisor = 2; divisor <= remainingValue; divisor++) {
        // Continuously divide 'remainingValue' by 'divisor' as long as it's perfectly divisible.
        while ((remainingValue % divisor) === 0) {
            foundFactors.push(divisor); // Add the divisor to our list of prime factors.
            remainingValue /= divisor; // Reduce 'remainingValue' by dividing it by the found factor.
        }
    }
    // Return the complete list of prime factors.
    return foundFactors;
}
