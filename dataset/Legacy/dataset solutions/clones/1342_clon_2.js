function ProcessInput(rawData) {
    // Clean and parse the raw input string into a 2D array of strings.
    let parsedLines = rawData.trim().split("\n").map(function(lineSegment) {
        return lineSegment.split(" ");
    });

    // Extract the base and exponent values from the first line of input.
    let baseVal = parseInt(parsedLines[0][0], 10); // The base number for exponentiation.
    let exponentVal = parseInt(parsedLines[0][1], 10); // The exponent.

    // Define constants for modular arithmetic.
    const moduloConst = 1000000007; // A large prime modulus (1e9 + 7).
    const splitConst = 500000; // A constant used for splitting multiplication (1e5 * 5).

    // Calculate and print the result of modular exponentiation.
    console.log(modularExponentiation(baseVal, exponentVal, moduloConst, splitConst));
}

// Implements modular exponentiation using the binary exponentiation (right-to-left) method.
function modularExponentiation(baseNum, expNum, modulus, splitFactor) {
    let resultAccumulator = 1; // Initialize the result to 1.
    let binaryExponent = expNum.toString(2); // Convert the exponent to its binary representation.
    let binaryLength = binaryExponent.length; // Get the length of the binary string.
    let currentPower = baseNum; // Initialize currentPower to the base number.

    // Iterate through the binary digits of the exponent from right to left.
    for (let loopIndex = 0; loopIndex < binaryLength; ++loopIndex) {
        // Check if the current binary digit is '1'.
        // The substr method is used to get characters from the end of the string.
        if (binaryExponent.substr((loopIndex + 1) * -1, 1) === '1') {
            // If the bit is '1', multiply the accumulator by the current power of the base.
            resultAccumulator = modularMultiply(resultAccumulator, currentPower, modulus, splitFactor);
        }
        // Square the current power of the base for the next iteration.
        currentPower = modularMultiply(currentPower, currentPower, modulus, splitFactor);
    }
    return resultAccumulator; // Return the final modular exponentiation result.
}

// Performs modular multiplication (a * b) % C using a splitting technique to prevent overflow.
function modularMultiply(factorOne, factorTwo, modVal, splitVal) {
    let quotientPart, remainderPart, productResult;

    // Split factorTwo into a quotient and a remainder based on splitVal.
    // This helps in performing multiplication in parts to avoid intermediate overflows
    // when numbers are large but within the modulus.
    quotientPart = (factorTwo / splitVal) | 0; // Integer division.
    remainderPart = factorTwo - (quotientPart * splitVal); // Remainder.

    // Calculate the product using the split parts and apply modulus at each step.
    // (factorOne * (quotientPart * splitVal + remainderPart)) % modVal
    // = ((factorOne * quotientPart * splitVal) % modVal + (factorOne * remainderPart) % modVal) % modVal
    productResult = (factorOne * quotientPart % modVal) * splitVal % modVal + (factorOne * remainderPart);

    // Ensure the final result is within the modulus.
    productResult %= modVal;
    return productResult; // Return the modular product.
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
