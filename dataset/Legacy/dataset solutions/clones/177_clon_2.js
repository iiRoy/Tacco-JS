function obtainSmallestDivisor(inputVal) {
    // Check if the number is divisible by 2. If so, 2 is its smallest prime factor.
    if (inputVal % 2 === 0) {
        return 2;
    }

    // Iterate through odd numbers starting from 3 up to the square root of the input value.
    // This is an optimized way to find prime factors.
    for (var currentDivisor = 3; currentDivisor * currentDivisor <= inputVal; currentDivisor += 2) {
        // If a divisor is found, return it immediately as it's the smallest.
        if (inputVal % currentDivisor === 0) {
            return currentDivisor;
        }
    }
    // If no smaller divisor is found, the number itself must be prime.
    return inputVal;
}

// Initialize an array with the first two prime numbers.
var primeNumbersCollection = [2, 3];

// This loop generates potential prime candidates using the 6k ± 1 optimization.
// It checks numbers of the form 6k-1 and 6k+1, which are candidates for primes.
for (var iterationCount = 1, limitValue = 50024; iterationCount * 6 + 1 < limitValue; iterationCount++) {
    // Calculate two candidate numbers based on the current iteration.
    var candidateOne = iterationCount * 6 - 1;
    var candidateTwo = iterationCount * 6 + 1;

    // If candidateOne is prime (its smallest divisor is itself), add it to the collection.
    obtainSmallestDivisor(candidateOne) === candidateOne && primeNumbersCollection.push(candidateOne);
    // If candidateTwo is prime, add it to the collection.
    obtainSmallestDivisor(candidateTwo) === candidateTwo && primeNumbersCollection.push(candidateTwo);
}

// Store the current size of the generated prime numbers collection for efficient access.
var collectionSize = primeNumbersCollection.length;

// Set up an event listener to process data received from standard input.
process.stdin.on("data", function(inputBuffer) {
    // Convert the input buffer to a string, remove leading/trailing whitespace,
    // and split it into an array of lines.
    // The .some() method iterates over each line.
    (inputBuffer + "").trim().split("\n").some(function(currentLine) {
        // Convert the current line (which is a string) into a number.
        currentLine = +currentLine;

        // Iterate through the sorted list of prime numbers to find the relevant pair.
        for (var listIndex = 0; listIndex < collectionSize; listIndex++) {
            // Find the first prime number in the collection that is greater than the input number.
            if (currentLine < primeNumbersCollection[listIndex]) {
                // Output the previous prime (or the one before that if the previous one matches the input)
                // and the current prime. This logic handles cases where the input itself is a prime.
                console.log(
                    (primeNumbersCollection[listIndex - 1] === currentLine ? primeNumbersCollection[listIndex - 2] : primeNumbersCollection[listIndex - 1]),
                    primeNumbersCollection[listIndex]
                );
                // Once the pair is found for the current input number, stop searching in this list.
                break;
            }
        }
        // Return false to ensure that the .some() method continues processing all lines from the input.
        return false;
    });
}).resume(); // Ensure the standard input stream remains open to receive all data.
