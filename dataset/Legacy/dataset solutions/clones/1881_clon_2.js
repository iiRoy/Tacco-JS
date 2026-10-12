// This function serves as the primary entry point for processing input data.
function ProcessInput(rawData) {
    // First, the raw input string is cleaned, split by newlines,
    // and then each line is further split by spaces.
    rawData = rawData.trim().split("\n").map(function(lineStr) {
        return lineStr.split(" ");
    });

    // Extract the three main numerical parameters from the first line of input.
    // These correspond to N, M, and K in the original problem context.
    var numItems = parseInt(rawData[0][0], 10); // Represents 'N'
    var modBase = parseInt(rawData[0][1], 10);  // Represents 'M'
    var selectionCount = parseInt(rawData[0][2], 10); // Represents 'K'

    // Define constants crucial for modular arithmetic operations.
    // primeModulus is the large prime number for modulo operations.
    // splitThreshold is a constant used in the modular multiplication helper for efficiency.
    var primeModulus = 998_244_353; // 'C'
    var splitThreshold = 100_000;   // 'C2'

    // Calculate binomial coefficients (combinations) for (N-1 choose r) where r ranges from 0 to K.
    // The result array is then reversed to align with the iteration logic that follows.
    var combinationsList = combinationsMod(numItems - 1, selectionCount, primeModulus, splitThreshold).reverse();

    // Compute the initial value for the power term: (M-1)^(N-K-1) modulo primeModulus.
    var currentPower = powerModulo(modBase - 1, numItems - selectionCount - 1, primeModulus, splitThreshold);

    // Initialize the variable that will accumulate the final computed result.
    var finalResult = 0;

    // Iterate through each combination value obtained from the combinationsList.
    for (var comboVal of combinationsList) {
        // This line ensures finalResult remains within the modulo range before addition.
        // It's effectively `finalResult = finalResult % primeModulus;`
        finalResult = multiplyModulo(finalResult, 1, primeModulus, splitThreshold);

        // Add the product of currentPower and the current combination value to finalResult.
        // All operations are performed modulo primeModulus.
        finalResult += multiplyModulo(currentPower, comboVal, primeModulus, splitThreshold);
        finalResult %= primeModulus; // Apply modulo to keep the result bounded.

        // Update currentPower for the next iteration by multiplying it with (M-1).
        currentPower = multiplyModulo(currentPower, modBase - 1, primeModulus, splitThreshold);
    }

    // After the loop, multiply the accumulated finalResult by M, modulo primeModulus.
    finalResult = multiplyModulo(finalResult, modBase, primeModulus, splitThreshold);

    // Output the final calculated answer to the console.
    console.log(finalResult);
}

// Helper function to perform modular multiplication (factorA * factorB) % modVal.
// It uses a splitPoint to handle potentially large intermediate products more efficiently.
function multiplyModulo(factorA, factorB, modVal, splitPoint) {
    var quotientPart, remainderPart, productResult;

    // Divide factorB into a quotient and a remainder based on the splitPoint.
    quotientPart = (factorB / splitPoint | 0); // Integer division to get the quotient.
    remainderPart = factorB - (quotientPart * splitPoint); // The remaining part.

    // Calculate the product using the distributive property:
    // (factorA * (quotientPart * splitPoint + remainderPart)) % modVal
    // This is broken down to prevent overflow before the final modulo.
    productResult = (factorA * quotientPart % modVal) * splitPoint % modVal + (factorA * remainderPart);
    productResult %= modVal; // Ensure the final result is within the modulo range.

    return productResult;
}

// Function to compute binomial coefficients (nCr) modulo a prime number.
// It returns an array containing [nC0, nC1, ..., nCk].
// Precomputation of factorials, inverse factorials, and modular inverses is used for efficiency.
function combinationsMod(upperBound, chooseCount, moduloValue, splitConstant) {
    // Array to store the computed nCr values.
    var resultArray = [];

    // Arrays for precomputing factorials, inverse factorials, and modular inverses.
    var factorials, inverseFactorials, modularInverses;
    factorials = [1, 1];
    inverseFactorials = [1, 1];
    modularInverses = [0, 1];

    // Precompute values up to 'upperBound'.
    for (var idx = 2; idx <= upperBound; idx++) {
        // Calculate factorial: fac[idx] = (fac[idx-1] * idx) % moduloValue
        factorials.push(factorials[idx - 1] * idx % moduloValue);
        // Calculate modular inverse using the property: inv[i] = MOD - (MOD/i) * inv[MOD%i] % MOD
        modularInverses.push(moduloValue - multiplyModulo(modularInverses[moduloValue % idx], (moduloValue / idx | 0), moduloValue, splitConstant) % moduloValue);
        // Calculate inverse factorial: finv[idx] = (finv[idx-1] * inv[idx]) % moduloValue
        inverseFactorials.push(multiplyModulo(inverseFactorials[idx - 1], modularInverses[idx], moduloValue, splitConstant));
    }

    // Compute nCr for r from 0 to chooseCount using the formula:
    // nCr = n! * (r!)^-1 * ((n-r)!)^-1 (mod P)
    for (var idx = 0; idx <= chooseCount; idx++) {
        var term1 = multiplyModulo(factorials[upperBound], inverseFactorials[upperBound - idx], moduloValue, splitConstant);
        var term2 = multiplyModulo(term1, inverseFactorials[idx], moduloValue, splitConstant);
        resultArray.push(term2);
    }
    return resultArray;
}

// Function to calculate (baseVal ^ exponentVal) % modulus using the method of exponentiation by squaring
// (also known as binary exponentiation).
function powerModulo(baseVal, exponentVal, modulus, splitNum) {
    var powerResult = 1; // Initialize the result to 1.
    var binaryExponent = exponentVal.toString(2); // Convert the exponent to its binary string representation.
    var exponentLength = binaryExponent.length; // Get the length of the binary string.
    var currentBasePower = baseVal; // Initialize a temporary variable to hold powers of the base.

    // Iterate through the bits of the binary exponent from right to left (least significant bit to most significant bit).
    for (var bitIndex = 0; bitIndex < exponentLength; bitIndex++) {
        // If the current bit is '1', multiply the powerResult by the currentBasePower.
        // The `substr` call extracts bits from the right end of the string.
        if (binaryExponent.substr((bitIndex + 1) * -1, 1) === '1') {
            powerResult = multiplyModulo(powerResult, currentBasePower, modulus, splitNum);
        }
        // Square the currentBasePower for the next bit position.
        currentBasePower = multiplyModulo(currentBasePower, currentBasePower, modulus, splitNum);
    }
    return powerResult;
}

// Execute the main processing function by reading input from standard input.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
