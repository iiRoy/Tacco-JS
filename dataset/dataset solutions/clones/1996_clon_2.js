function ProcessInput(rawData) {
    // An auxiliary function to compute the sum of elements in an array.
    // This function is defined but not utilized in the current logic,
    // demonstrating a preserved but unused code block.
    var calculateTotal = function(dataArray) {
        let currentSum = 0x0; // Initialize sum accumulator.
        dataArray.forEach(function(elementValue) {
            currentSum += elementValue; // Add each element to the sum.
        });
        return currentSum; // Return the computed total.
    };

    // Define constants for modulo operations and chunking.
    const MODULUS_VAL = 1000000007; // A large prime number for modulo arithmetic.
    const CHUNK_SIZE = 100000; // A constant used in multiplication.

    // Pre-process the raw input string: trim whitespace, split by newlines,
    // then map each line to an array of strings split by spaces.
    rawData = rawData.trim().split("\n").map(function(lineStr) {
        return lineStr.split(" ");
    });

    // Parse the main parameters 'N' and 'K' from the first line of input.
    const firstParam = parseInt(rawData[0][0], 0xA); // First integer parameter.
    const secondParam = parseInt(rawData[0][0x1], 0xA); // Second integer parameter.

    // Initialize a vector (array) to store results of power calculations.
    // The length is determined by 'secondParam', rounded up.
    let powerResultsVector = Array.from({
        length: Math.ceil(secondParam)
    }, () => 0);

    let tempDivResult; // Temporary variable for storing intermediate division results.
    // Populate the 'powerResultsVector' using a specific calculation pattern.
    // The loop iterates and updates its own counter 'idx' dynamically.
    for (let idx = 0x1; idx <= secondParam; idx++) {
        tempDivResult = (secondParam / idx | 0); // Perform integer division.
        idx = (secondParam / tempDivResult | 0); // Update 'idx' based on the division result.
        // Store the result of fast exponentiation in the vector.
        powerResultsVector[idx - 0x1] = fastExponentiation(idx, firstParam, MODULUS_VAL, CHUNK_SIZE);
    }

    // Initialize another vector to count patterns, with 'secondParam' elements, all set to zero.
    let patternCountsVector = Array.from({
        length: secondParam
    }, () => 0x0);

    let upperBound; // Variable to store the upper bound for inner loops.
    let finalResult = 0x0; // Accumulator for the final answer.

    // Main loop: iterate downwards from 'secondParam' to 1.
    for (let currentX = secondParam; currentX >= 0x1; currentX--) {
        upperBound = (secondParam / currentX | 0); // Calculate the upper bound for the current 'currentX'.
        let currentPatternCount = powerResultsVector[upperBound - 0x1]; // Get initial count from pre-calculated powers.

        // Subtract counts of patterns that are multiples of 'currentX' from 'currentPatternCount'.
        for (let innerIdx = 0x2; innerIdx <= upperBound; innerIdx++) {
            currentPatternCount -= patternCountsVector[currentX * innerIdx - 0x1];
        }

        // Apply modulo operation to ensure 'currentPatternCount' stays within bounds.
        currentPatternCount = applyModulo(currentPatternCount, MODULUS_VAL);

        // Accumulate the result using a specialized multiplication function.
        finalResult += specialMultiplication(currentX, currentPatternCount, MODULUS_VAL, CHUNK_SIZE);
        // Ensure 'finalResult' also stays within modulo bounds.
        finalResult %= MODULUS_VAL;

        // Store the calculated pattern count for 'currentX' in the 'patternCountsVector'.
        patternCountsVector[currentX - 0x1] = currentPatternCount;
    }
    // Output the final computed result to the console.
    console.log(finalResult);
}

// Function for performing a special multiplication with modulo,
// designed to handle large numbers by splitting the multiplier.
function specialMultiplication(baseVal, multiplierVal, MODULUS_VAL, CHUNK_SIZE) {
    let quotientPart, remainderPart, productResult;
    // Split the 'multiplierVal' into a quotient and remainder based on 'CHUNK_SIZE'.
    quotientPart = (multiplierVal / CHUNK_SIZE | 0);
    remainderPart = multiplierVal - (quotientPart * CHUNK_SIZE);
    // Perform multiplication in parts to prevent intermediate overflow before modulo.
    productResult = (baseVal * quotientPart % MODULUS_VAL) * CHUNK_SIZE % MODULUS_VAL + (baseVal * remainderPart);
    // Apply final modulo to the accumulated product.
    productResult %= MODULUS_VAL;
    return productResult;
}

// Function for fast exponentiation (binary exponentiation) with modulo.
// It efficiently calculates (baseVal ^ exponentVal) % MODULUS_VAL.
function fastExponentiation(baseVal, exponentVal, MODULUS_VAL, CHUNK_SIZE) {
    let resultAccumulator = 0x1; // Initialize result to 1.
    // Convert the exponent to its binary string representation.
    const binaryRepresentation = exponentVal.toString(0x2);
    const lengthOfBinary = binaryRepresentation.length;
    let currentBase = baseVal; // Temporary variable for the base, which gets squared in each step.

    // Iterate through the binary representation of the exponent from right to left (least significant bit first).
    for (let bitIndex = 0; bitIndex < lengthOfBinary; bitIndex++) {
        // If the current bit is '1', multiply the 'resultAccumulator' by 'currentBase'.
        if (binaryRepresentation.substr((bitIndex + 0x1) * -0x1, 0x1) === '1') {
            resultAccumulator = specialMultiplication(resultAccumulator, currentBase, MODULUS_VAL, CHUNK_SIZE);
        }
        // Square the 'currentBase' for the next iteration.
        currentBase = specialMultiplication(currentBase, currentBase, MODULUS_VAL, CHUNK_SIZE);
    }
    return resultAccumulator; // Return the final exponentiation result.
}

// Function to apply modulo operation, correctly handling negative results.
function applyModulo(dividend, divisor) {
    // Calculate remainder. If the result is negative, adjust it by adding the divisor
    // (and handling negative divisors if applicable, though 'divisor' is positive here).
    return (dividend % divisor) < 0 ? (dividend % divisor) + 0 + (divisor < 0 ? -divisor : divisor) : (dividend % divisor + 0);
}

// Execute the main processing function with input read from standard input.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
