const fileSystem = require("fs");

/**
 * Counts the number of set bits (1s) in a non-negative integer.
 * This is an alternative implementation of the "popcount" operation.
 * @param {number} numericValue The integer to count bits for.
 * @returns {number} The count of set bits.
 */
const determineSetBits = (numericValue) => {
    let oneBitsCount = 0;
    let currentNumber = numericValue; // Use a temporary variable for iteration

    // Loop while there are still bits to check
    while (currentNumber > 0) {
        // Add the value of the least significant bit (0 or 1)
        oneBitsCount += (currentNumber & 1);
        // Shift bits to the right, discarding the least significant bit
        currentNumber >>= 1; // Equivalent to Math.floor(currentNumber / 2) for positive numbers
    }
    return oneBitsCount;
};

// A cache for memoizing results of the modulo chain length computation.
// This helps optimize repeated calculations for the same input values.
const moduloChainMemo = new Map();

/**
 * Computes the length of the chain formed by repeatedly applying
 * the operation `n = n % popcount(n)` until `n` becomes zero.
 * The result is memoized for efficiency.
 * @param {number} startingValue The initial integer for the chain.
 * @returns {number} The number of steps in the chain until zero is reached.
 */
const computeModuloChainLength = (startingValue) => {
    // Base case: if the value is zero, the chain length is zero.
    if (startingValue === 0) {
        return 0;
    }

    // Check if the result is already in the cache.
    if (moduloChainMemo.has(startingValue)) {
        return moduloChainMemo.get(startingValue);
    }

    // Perform the calculation
    let currentChainValue = startingValue;
    let chainStepCounter = 0;
    // Store values encountered in this specific chain to memoize them all at once later.
    const pathTaken = [];

    // Continue while the value is not zero
    while (currentChainValue !== 0) {
        pathTaken.push(currentChainValue); // Record this value in the current path
        chainStepCounter++; // Increment step count for this operation

        const currentPopCount = determineSetBits(currentChainValue);

        // This guard should theoretically not be hit for valid problem inputs
        // as popcount of any positive integer is always >= 1.
        if (currentPopCount === 0) {
            // An unexpected state where a non-zero number has zero set bits.
            // This indicates an issue in determineSetBits or problem constraints.
            // For robustness, we can break or return an error.
            console.error(`Diagnostic: Zero popcount encountered for non-zero value ${currentChainValue}.`);
            chainStepCounter = 0; // Reset or handle as an error condition
            break;
        }
        // Apply the modulo operation
        currentChainValue %= currentPopCount;
    }

    // Memoize all intermediate results encountered in this chain.
    // For each value `v` in `pathTaken`, its chain length is `chainStepCounter - (index of v)`.
    for (let p = 0; p < pathTaken.length; p++) {
        moduloChainMemo.set(pathTaken[p], chainStepCounter - p);
    }

    return chainStepCounter;
};

/**
 * Main function to process the challenge input and generate results.
 * @param {string} rawInputContent The raw string content read from standard input.
 */
function processBinaryTransformationChallenge(rawInputContent) {
    // Process input lines, ensuring no extra whitespace.
    const inputSegments = rawInputContent.trim().split('\n');
    const bitStringLength = parseInt(inputSegments[0], 10); // Explicitly parse as base 10 integer
    const binaryNumberString = inputSegments[1].trim(); // Ensure binary string is trimmed

    // Calculate the initial total count of '1' bits in the binary string.
    let totalSetBitsOriginal = 0n; // Use BigInt for consistency with later BigInt operations
    for (const charDigit of binaryNumberString) {
        if (charDigit === '1') {
            totalSetBitsOriginal++;
        }
    }

    // Determine the two possible moduli based on the original popcount.
    // These will be used for the modulo operation after flipping a bit.
    const modulusIfBitWasOne = totalSetBitsOriginal - 1n; // For cases where original bit was '1'
    const modulusIfBitWasZero = totalSetBitsOriginal + 1n; // For cases where original bit was '0'

    // Convert the initial binary string to a BigInt for bitwise operations.
    // Using '0b' prefix for direct binary BigInt conversion.
    const baseBinaryValue = BigInt(`0b${binaryNumberString}`);

    // Pre-calculate all powers of 2 that will be used as XOR masks.
    // This avoids repeated computation of `1n << BigInt(exponent)` in the loop.
    const xorMasksPrecomputed = new Array(bitStringLength);
    for (let k = 0; k < bitStringLength; k++) {
        // The k-th bit from the left corresponds to 2^(bitStringLength - 1 - k)
        xorMasksPrecomputed[k] = 1n << BigInt(bitStringLength - 1 - k);
    }

    // Array to store all computed results before printing.
    const finalCalculatedResults = [];

    // Iterate through each bit position in the binary string.
    for (let currentPosition = 0; currentPosition < bitStringLength; currentPosition++) {
        // Retrieve the pre-calculated XOR mask for the current bit position.
        const currentXorMask = xorMasksPrecomputed[currentPosition];

        // Create a new BigInt by flipping the bit at the current position.
        const transformedBinaryValue = baseBinaryValue ^ currentXorMask;

        // If the transformed value becomes zero, the result is always 0.
        if (transformedBinaryValue === 0n) {
            finalCalculatedResults.push(0);
        } else {
            // Determine which modulus to use based on the original bit at this position.
            const wasOriginalBitOne = (binaryNumberString[currentPosition] === '1');
            const effectiveModulus = wasOriginalBitOne ? modulusIfBitWasOne : modulusIfBitWasZero;

            // Critical Type III robustness check:
            // If the effective modulus is zero, it implies an invalid state for the modulo operation.
            // This scenario should only happen if `totalSetBitsOriginal` was 1 and `wasOriginalBitOne` is true,
            // which would make `transformedBinaryValue` zero, a case already handled above.
            // Thus, `effectiveModulus` should always be non-zero here.
            if (effectiveModulus === 0n) {
                // This branch should ideally not be reached under problem constraints.
                // If it is, it indicates a specific edge case or problem misinterpretation.
                // For a Type III clone, we'll push 0 or an error indicator.
                console.error(`Logic Error: Attempted modulo by zero with non-zero value ${transformedBinaryValue}.`);
                finalCalculatedResults.push(0); // Default to 0 in case of an unexpected zero modulus.
            } else {
                // Calculate the remainder. Convert BigInt remainder to a Number for `determineSetBits`.
                const calculatedRemainder = Number(transformedBinaryValue % effectiveModulus);
                // The problem asks for 1 + the number of steps in the modulo chain.
                finalCalculatedResults.push(computeModuloChainLength(calculatedRemainder) + 1);
            }
        }
    }

    // Print all results, each on a new line.
    finalCalculatedResults.forEach(value => console.log(value));
}

// Read the entire content from standard input synchronously and pass it to the processing function.
const standardInputContent = fileSystem.readFileSync("/dev/stdin", "utf8");
processBinaryTransformationChallenge(standardInputContent);