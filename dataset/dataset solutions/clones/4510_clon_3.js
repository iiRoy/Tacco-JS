const PRIME_MODULO = 1000000007; // A large prime number often used as a modulus in competitive programming.

// Helper function to calculate the absolute difference between two numerical values.
const getAbsoluteDifference = (valA, valB) => Math.abs(valA - valB);

// Computes the factorial of a non-negative integer, modulo PRIME_MODULO.
// This function handles edge cases like 0! and ensures intermediate products do not overflow.
const computeFactorialModulo = (inputNumber) => {
    // Input validation: Factorial is conventionally defined for non-negative integers.
    // For negative inputs, we'll return 0, as it's outside the standard domain.
    if (inputNumber < 0) {
        console.warn("Warning: Attempted to compute factorial for a negative number. Returning 0.");
        return 0;
    }

    // Base case for factorial: 0! is defined as 1.
    if (inputNumber === 0) {
        return 1;
    }

    // Initialize the product accumulator. Start with 1 as it's the multiplicative identity.
    let currentProduct = 1;
    // Iterate from 1 up to the input number, multiplying each integer.
    for (let loopCounter = 1; loopCounter <= inputNumber; loopCounter++) {
        // Multiply the current product by the loop counter and apply the modulo operation.
        // This prevents the product from becoming excessively large before the final modulo.
        currentProduct = (currentProduct * loopCounter) % PRIME_MODULO;
    }
    return currentProduct;
};

// Main processing unit: takes raw string input, parses it, and applies business logic.
const processInputAndComputeResult = (rawDataString) => {
    // Split the raw input string by space to get individual string tokens.
    const dataTokens = rawDataString.trim().split(" ");

    // Input structure validation: Expecting exactly two numbers.
    if (dataTokens.length !== 2) {
        console.error(`Error: Invalid input format. Expected two space-separated numbers, but received ${dataTokens.length} tokens.`);
        return 0; // Return 0 for malformed input.
    }

    // Attempt to parse string tokens into numerical values.
    // Using map ensures both are processed, and destructuring assigns them efficiently.
    const [firstOperand, secondOperand] = dataTokens.map(token => {
        const parsedNum = Number(token);
        // Validate if the parsed token is a valid number.
        if (isNaN(parsedNum)) {
            console.error(`Error: Invalid number encountered in input: '${token}'.`);
            return null; // Use null to signify a parsing failure.
        }
        return parsedNum;
    });

    // Consolidated check for any parsing failures.
    if (firstOperand === null || secondOperand === null) {
        return 0; // If any number failed to parse, the overall result is 0.
    }

    // Calculate the absolute difference between the two parsed operands.
    const numericalDifference = getAbsoluteDifference(firstOperand, secondOperand);

    let finalCalculatedValue; // This variable will store the ultimate result of the computation.

    // Conditional logic based on the difference between the two input numbers.
    if (numericalDifference >= 2) {
        // If the absolute difference is 2 or more, the problem specifies a result of 0.
        finalCalculatedValue = 0;
    } else if (firstOperand === secondOperand) {
        // If the two operands are identical (difference is 0).
        // Calculate factorials for both numbers using the modulo function.
        const factorialOfN = computeFactorialModulo(firstOperand);
        const factorialOfM = computeFactorialModulo(secondOperand);

        // For this specific case, the result is (N! * M! * 2) % PRIME_MODULO.
        // Perform multiplication steps with modulo to prevent overflow.
        let intermediateProduct = (factorialOfN * factorialOfM) % PRIME_MODULO;
        finalCalculatedValue = (intermediateProduct * 2) % PRIME_MODULO;
    } else { // This implies numericalDifference === 1 (the only remaining case).
        // If the absolute difference between operands is 1.
        // Calculate factorials for both numbers.
        const factorialOfN = computeFactorialModulo(firstOperand);
        const factorialOfM = computeFactorialModulo(secondOperand);

        // For a difference of 1, the result is (N! * M!) % PRIME_MODULO.
        finalCalculatedValue = (factorialOfN * factorialOfM) % PRIME_MODULO;
    }

    return finalCalculatedValue;
};

// --- Program Execution Entry Point ---

// Import the Node.js file system module for reading standard input.
const fileSystemModule = require("fs");

// Define the standard input file path.
const stdinFilePath = "/dev/stdin";

let gatheredInputData = "";
try {
    // Attempt to synchronously read the content of the standard input file.
    // 'utf8' encoding ensures the data is read as a string.
    gatheredInputData = fileSystemModule.readFileSync(stdinFilePath, "utf8");
} catch (readError) {
    // Log an error if there's an issue reading from stdin.
    console.error(`An error occurred while reading from stdin: ${readError.message}`);
    // In case of an error, provide an empty string to prevent further processing issues.
    gatheredInputData = "";
}

// Invoke the main processing function with the obtained input data.
const finalComputedResult = processInputAndComputeResult(gatheredInputData);

// Output the final result to the console.
console.log(finalComputedResult);