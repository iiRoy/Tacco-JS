// Function: checkPrimality
// Determines if a given integer is a prime number using an optimized algorithm.
// This function avoids checking even numbers and multiples of three after initial checks,
// and then proceeds to check divisors of the form 6k ± 1.
function checkPrimality(candidateNumber) {
    // --- Input Validation and Edge Cases ---

    // Ensure the input is a valid positive integer.
    // Numbers that are not integers, or are negative, or zero, cannot be prime.
    if (typeof candidateNumber !== 'number' || !Number.isInteger(candidateNumber) || candidateNumber < 1) {
        // Non-valid inputs are not considered prime.
        return false;
    }

    // Explicitly handle the number 1, which is not prime by definition.
    if (candidateNumber === 1) {
        return false;
    }

    // Handle the smallest prime numbers: 2 and 3.
    // These are base cases that are prime.
    if (candidateNumber === 2 || candidateNumber === 3) {
        return true;
    }

    // --- Initial Divisibility Checks ---

    // Any even number greater than 2 is not prime.
    // Any number divisible by 3 (and greater than 3) is not prime.
    // This quickly filters out a significant portion of composite numbers.
    if (candidateNumber % 2 === 0 || candidateNumber % 3 === 0) {
        return false;
    }

    // --- Optimized Loop for Remaining Primes ---

    // All prime numbers greater than 3 can be expressed in the form 6k ± 1.
    // We only need to check for potential divisors up to the square root of the candidateNumber.
    // Calculating the square root once saves repeated computations.
    const rootValue = Math.sqrt(candidateNumber);
    // The upper bound for our divisor checks (inclusive).
    const divisorCheckLimit = Math.floor(rootValue);

    let kFactor = 1; // Initialize the factor 'k' for the 6k ± 1 form.

    // Loop indefinitely until a break condition is met.
    // This structure is an alternative to a traditional 'for' loop.
    while (true) {
        // Calculate the two potential divisors for the current kFactor.
        const potentialDivisorMinusOne = (kFactor * 6) - 1;
        const potentialDivisorPlusOne = (kFactor * 6) + 1;

        // If the first potential divisor (6k - 1) exceeds our calculated limit,
        // it means we have checked all necessary divisors, and the number must be prime.
        if (potentialDivisorMinusOne > divisorCheckLimit) {
            break; // Exit the loop as no divisors were found.
        }

        // Check if the candidate number is divisible by either of the potential divisors.
        // If it is, then the number is not prime.
        if (candidateNumber % potentialDivisorMinusOne === 0 || candidateNumber % potentialDivisorPlusOne === 0) {
            return false; // Found a divisor, so it's a composite number.
        }

        kFactor++; // Increment kFactor to check the next pair of potential divisors.
    }

    // If the loop completes without finding any divisors, the number is prime.
    return true;
}

// --- Standard Input Processing ---

// Keep the Node.js process alive to listen for input.
process.stdin.resume();

// Define the character encoding for the incoming data stream.
const standardInputEncoding = 'utf8';
process.stdin.setEncoding(standardInputEncoding);

// Attach an event listener to the 'data' event of the standard input stream.
// This function will be called whenever data is received from stdin.
process.stdin.on('data', function handleIncomingData(inputBuffer) {
    // Convert the raw buffer to a string and split it into an array of lines.
    // Use a regular expression to handle both Unix-style ('\n') and Windows-style ('\r\n') newlines.
    const rawInputLines = inputBuffer.toString().split(/\r?\n/);

    // Filter out any lines that are empty or contain only whitespace.
    const cleanedInputStrings = rawInputLines.filter(line => line.trim() !== '');

    // The problem statement implies that the first line of input often contains metadata (like a count)
    // and should be skipped, with actual data starting from the second line.
    const dataLinesForProcessing = cleanedInputStrings.slice(1);

    // Transform the array of string lines into an array of numbers.
    // Also, filter out any values that could not be successfully converted to a valid, finite number.
    const numericalValuesToEvaluate = dataLinesForProcessing
        .map(str => Number(str.trim())) // Convert each string to a number, trimming whitespace first.
        .filter(val => !isNaN(val) && Number.isFinite(val)); // Keep only valid, finite numbers.

    let totalPrimeCount = 0; // Initialize a counter for prime numbers found.

    // Iterate through each numeric value obtained from the input.
    for (const valueEntry of numericalValuesToEvaluate) {
        // Use the checkPrimality function to determine if the current number is prime.
        if (checkPrimality(valueEntry)) {
            totalPrimeCount++; // If it's prime, increment the counter.
        }
    }

    // Output the final count of prime numbers to the console.
    console.log(totalPrimeCount);
});