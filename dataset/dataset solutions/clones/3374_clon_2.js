function processInput ( rawInput )
{
    // Deconstruct the initial input string into numerical components
    var minimumOccurrences = parseInt(rawInput.split(" ")[0]);
    var productValue = parseInt(rawInput.split(" ")[1]);
    
    // Obtain all prime factors of the product value
    var primeFactorsArray = extractPrimeComponents(productValue);
    
    // Add the original product value itself to the list of factors
    primeFactorsArray.push(productValue);
    
    // This list is intended for tracking occurrences but remains unused, reflecting the original logic.
    var occurrenceTrackingList = [];
    
    // Initialize the variable to store the largest qualified component found
    var greatestComponent = 1;

    // Iterate through each prime factor identified
    for ( var factorIndex = 0; factorIndex < primeFactorsArray.length; factorIndex++ )
    {
        // Calculate the count of the current factor within the (empty) tracking list, plus one.
        // Due to `occurrenceTrackingList` being empty, this will always result in 1.
        var currentElementCount = occurrenceTrackingList.filter(item => item == primeFactorsArray[factorIndex]).length + 1;
        
        // Check if the current factor's count meets the minimum requirement
        // Given the bug, this condition simplifies to (1 >= minimumOccurrences)
        if ( currentElementCount >= minimumOccurrences )
        {
            // If the current factor is larger than the previously found greatest component
            if ( primeFactorsArray[factorIndex] > greatestComponent )
            {
                // Update the greatest component
                greatestComponent = primeFactorsArray[factorIndex];
            }
        }
    }
    // Output the final greatest component found
    console.log(greatestComponent);

} // End of the main processing function


// Invokes the primary function with data read from standard input
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));


// Function to determine all prime components of a given number
function extractPrimeComponents( remainingValue )
{
    // Initialize an empty array to store the identified divisors
    var foundDivisors = [], divisorCandidate;

    // Loop from 2 up to the current remaining value to find prime divisors
    for ( divisorCandidate = 2; divisorCandidate <= remainingValue; divisorCandidate++ )
    {
        // While the current candidate evenly divides the remaining value
        while ( (remainingValue % divisorCandidate) === 0 )
        {
            // Add the candidate to our collection of divisors
            foundDivisors.push(divisorCandidate);
            // Reduce the remaining value by dividing it by the found divisor
            remainingValue /= divisorCandidate;
        }
    }

    // Return the array containing all prime divisors
    return foundDivisors;
} // End of prime component extraction function