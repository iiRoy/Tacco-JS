const primeModulo = 10 ** 9 + 7; // A large prime number used as a modulus for calculations

/**
 * Computes (baseVal ^ exponentVal) modulo primeModulo.
 * This function implements modular exponentiation using a simple iterative approach.
 *
 * @param {number} baseVal The base number for the exponentiation.
 * @param {number} exponentVal The exponent to raise the base to.
 * @returns {number} The result of (baseVal ^ exponentVal) % primeModulo.
 */
function calculatePower(baseVal, exponentVal) {
    let resultAccumulator = 1; // Initialize the result to 1 (any number to the power of 0 is 1)

    // Loop 'exponentVal' times, multiplying the base and applying the modulus at each step
    for (let loopCounter = 0; loopCounter < exponentVal; loopCounter++) {
        resultAccumulator = (resultAccumulator * baseVal) % primeModulo; // Perform multiplication and then modulo
    }

    return resultAccumulator; // Return the final modular power
}

/**
 * The primary function that processes the input and calculates the required value.
 * It computes a specific combinatorial expression (10^n - 2*9^n + 8^n) modulo primeModulo.
 *
 * @param {string} rawData The input string, which is expected to be a single integer.
 */
function ProcessInput(rawData) {
    // Convert the input string into an integer
    const parsedNumber = parseInt(rawData, 10); // Using radix 10 for explicit base

    // Calculate the core expression: (10^n - 2 * 9^n + 8^n)
    // This often relates to problems involving inclusion-exclusion principles.
    let finalResult = calculatePower(10, parsedNumber) - (calculatePower(9, parsedNumber) * 2) + calculatePower(8, parsedNumber);

    // Apply the modulus to the result.
    // The first modulo ensures the number is within the range [-primeModulo + 1, primeModulo - 1].
    finalResult = finalResult % primeModulo;

    // The second modulo handles potential negative results from subtraction,
    // ensuring the final result is always positive and within [0, primeModulo - 1].
    finalResult = (finalResult + primeModulo) % primeModulo;

    // Output the computed final value to the standard console.
    console.log(finalResult);
}

// Read the input from standard input (usually /dev/stdin in competitive programming environments)
// and then pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
