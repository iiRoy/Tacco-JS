const PRIME_MODULUS_224 = Bignum.ONE_CONSTANT.bitShiftLeft(224)
    .plus(Bignum.ONE_CONSTANT.bitShiftLeft(140))
    .plus(Bignum.ONE_CONSTANT.bitShiftLeft(56))
    .plus(Bignum.ONE_CONSTANT);

/**
 * Executes a series of in-place additions on large numbers and measures the performance.
 * @param {number} loopCount The number of outer loop iterations for the benchmark.
 * @returns {number} The average time in microseconds per individual addition operation.
 */
function benchmarkAddition(loopCount) {
    // Validate the input: loopCount must be a positive integer.
    if (typeof loopCount !== 'number' || !Number.isInteger(loopCount) || loopCount <= 0) {
        console.warn("Invalid loopCount provided for benchmarkAddition. Using default of 1000.");
        loopCount = 1000;
    }

    let operandCollection = []; // Array to hold the large number operands
    let reductionOperand = allocateNewBignum(); // A placeholder for modular reduction context, if required by the Bignum library
    const collectionSize = 21; // The fixed number of elements in the operand array
    const effectiveOperationsPerIteration = collectionSize - 1; // Number of distinct additions performed in each inner loop pass

    // Populate the operand array with random large integers, ensuring they are within the modulus.
    for (let currentIdx = 0; currentIdx < collectionSize; currentIdx++) {
        operandCollection[currentIdx] = generateRandomBignum(100).applyModulo(PRIME_MODULUS_224);
    }

    const startTimestamp = Date.now(); // Capture the starting timestamp for performance measurement

    // Main benchmark loop: executes the specified number of outer iterations.
    for (let currentLoop = 0; currentLoop < loopCount; currentLoop++) {
        // Inner loop performs a chain of additions using adjacent elements.
        for (let opIdx = 0; opIdx < effectiveOperationsPerIteration; opIdx++) {
            operandCollection[opIdx].accumulateInPlace(operandCollection[opIdx + 1], reductionOperand);
        }
    }

    const endTimestamp = Date.now(); // Capture the ending timestamp
    const durationMs = endTimestamp - startTimestamp; // Calculate the total elapsed time in milliseconds

    // Calculate and return the average time per individual addition operation.
    const totalOperationsPerformed = loopCount * effectiveOperationsPerIteration;
    return (1000 * durationMs) / totalOperationsPerformed; // Convert ms to microseconds for finer granularity
}

/**
 * Executes a series of in-place subtractions on large numbers and measures the performance.
 * @param {number} loopCount The number of outer loop iterations for the benchmark.
 * @returns {number} The average time in microseconds per individual subtraction operation.
 */
function benchmarkSubtraction(loopCount) {
    // Validate the input.
    if (typeof loopCount !== 'number' || !Number.isInteger(loopCount) || loopCount <= 0) {
        console.warn("Invalid loopCount provided for benchmarkSubtraction. Using default of 1000.");
        loopCount = 1000;
    }

    let operandCollection = [];
    let reductionOperand = allocateNewBignum();
    const collectionSize = 21;
    const effectiveOperationsPerIteration = collectionSize - 1;

    for (let currentIdx = 0; currentIdx < collectionSize; currentIdx++) {
        operandCollection[currentIdx] = generateRandomBignum(100).applyModulo(PRIME_MODULUS_224);
    }

    const startTimestamp = Date.now();

    for (let currentLoop = 0; currentLoop < loopCount; currentLoop++) {
        for (let opIdx = 0; opIdx < effectiveOperationsPerIteration; opIdx++) {
            operandCollection[opIdx].decrementInPlace(operandCollection[opIdx + 1], reductionOperand);
        }
    }

    const endTimestamp = Date.now();
    const durationMs = endTimestamp - startTimestamp;

    const totalOperationsPerformed = loopCount * effectiveOperationsPerIteration;
    return (1000 * durationMs) / totalOperationsPerformed;
}

/**
 * Executes a series of multiplications on large numbers (followed by modular reduction) and measures performance.
 * Note: The original benchmark only performs two distinct multiplications per inner loop iteration.
 * @param {number} loopCount The number of outer loop iterations for the benchmark.
 * @returns {number} The average time in microseconds per individual multiplication operation.
 */
function benchmarkMultiplication(loopCount) {
    // Validate the input.
    if (typeof loopCount !== 'number' || !Number.isInteger(loopCount) || loopCount <= 0) {
        console.warn("Invalid loopCount provided for benchmarkMultiplication. Using default of 1000.");
        loopCount = 1000;
    }

    let operandCollection = [];
    let reductionOperand = allocateNewBignum();
    const collectionSize = 21; // Size of the array storing operands
    const innerLoopScalar = 10; // Factor by which the outer loop count is multiplied for this benchmark
    const actualMultiplicationsPerInnerRun = 2; // As observed from the original code (only two lines were uncommented)

    for (let currentIdx = 0; currentIdx < collectionSize; currentIdx++) {
        operandCollection[currentIdx] = generateRandomBignum(100).applyModulo(PRIME_MODULUS_224);
    }

    const startTimestamp = Date.now();

    // The total number of iterations for this benchmark is loopCount * innerLoopScalar.
    for (let currentLoop = 0; currentLoop < loopCount * innerLoopScalar; currentLoop++) {
        let intermediateProduct; // Variable to store the result of each multiplication

        // Perform the first multiplication and modular reduction.
        intermediateProduct = operandCollection[0].productOf(operandCollection[1]);
        intermediateProduct.reduceByPrimeModulus(PRIME_MODULUS_224, reductionOperand);

        // Perform the second multiplication and modular reduction.
        intermediateProduct = operandCollection[1].productOf(operandCollection[2]);
        intermediateProduct.reduceByPrimeModulus(PRIME_MODULUS_224, reductionOperand);
    }

    const endTimestamp = Date.now();
    const durationMs = endTimestamp - startTimestamp;

    // The total count of actual multiplication operations performed.
    const totalOperationsPerformed = loopCount * innerLoopScalar * actualMultiplicationsPerInnerRun;
    return (1000 * durationMs) / totalOperationsPerformed;
}

/**
 * Executes a series of squaring operations on large numbers (followed by modular reduction) and measures performance.
 * Note: The original benchmark only performs two distinct squaring operations per inner loop iteration.
 * @param {number} loopCount The number of outer loop iterations for the benchmark.
 * @returns {number} The average time in microseconds per individual squaring operation.
 */
function benchmarkSquaring(loopCount) {
    // Validate the input.
    if (typeof loopCount !== 'number' || !Number.isInteger(loopCount) || loopCount <= 0) {
        console.warn("Invalid loopCount provided for benchmarkSquaring. Using default of 1000.");
        loopCount = 1000;
    }

    let operandCollection = [];
    let reductionOperand = allocateNewBignum();
    const collectionSize = 21;
    const innerLoopScalar = 10;
    const actualSquaringsPerInnerRun = 2; // As observed from the original code

    for (let currentIdx = 0; currentIdx < collectionSize; currentIdx++) {
        operandCollection[currentIdx] = generateRandomBignum(100).applyModulo(PRIME_MODULUS_224);
    }

    const startTimestamp = Date.now();

    for (let currentLoop = 0; currentLoop < loopCount * innerLoopScalar; currentLoop++) {
        let squaredValue; // Variable to store the result of each squaring operation

        // Perform the first squaring and modular reduction.
        squaredValue = operandCollection[0].squareValue();
        squaredValue.reduceByPrimeModulus(PRIME_MODULUS_224, reductionOperand);

        // Perform the second squaring and modular reduction.
        squaredValue = operandCollection[1].squareValue();
        squaredValue.reduceByPrimeModulus(PRIME_MODULUS_224, reductionOperand);
    }

    const endTimestamp = Date.now();
    const durationMs = endTimestamp - startTimestamp;

    const totalOperationsPerformed = loopCount * innerLoopScalar * actualSquaringsPerInnerRun;
    return (1000 * durationMs) / totalOperationsPerformed;
}

/**
 * Executes a series of modular reduction operations on large numbers and measures the performance.
 * @param {number} loopCount The number of outer loop iterations for the benchmark.
 * @returns {number} The average time in microseconds per individual reduction operation.
 */
function benchmarkReduction(loopCount) {
    // Validate the input.
    if (typeof loopCount !== 'number' || !Number.isInteger(loopCount) || loopCount <= 0) {
        console.warn("Invalid loopCount provided for benchmarkReduction. Using default of 1000.");
        loopCount = 1000;
    }

    let operandCollection = [];
    let reductionOperand = allocateNewBignum();
    const collectionSize = 21;
    const effectiveOperationsPerIteration = collectionSize - 1; // 20 reductions per outer loop iteration

    // Initialize the collection. Each element is a product of two random numbers,
    // ensuring they are potentially larger than the modulus before reduction.
    for (let currentIdx = 0; currentIdx < collectionSize; currentIdx++) {
        const value1 = generateRandomBignum(100).applyModulo(PRIME_MODULUS_224);
        const value2 = generateRandomBignum(100).applyModulo(PRIME_MODULUS_224);
        operandCollection[currentIdx] = value1.productOf(value2);
    }

    const startTimestamp = Date.now();

    for (let currentLoop = 0; currentLoop < loopCount; currentLoop++) {
        // Perform modular reduction on each element in the collection (except the last).
        for (let opIdx = 0; opIdx < effectiveOperationsPerIteration; opIdx++) {
            operandCollection[opIdx].reduceByPrimeModulus(PRIME_MODULUS_224, reductionOperand);
        }
    }

    const endTimestamp = Date.now();
    const durationMs = endTimestamp - startTimestamp;

    const totalOperationsPerformed = loopCount * effectiveOperationsPerIteration;
    return (1000 * durationMs) / totalOperationsPerformed;
}

/**
 * Executes a series of modular inverse operations on large numbers and measures the performance.
 * @param {number} loopCount The number of outer loop iterations for the benchmark.
 * @returns {number} The average time in microseconds per individual modular inverse operation.
 */
function benchmarkModularInverse(loopCount) {
    // Validate the input.
    if (typeof loopCount !== 'number' || !Number.isInteger(loopCount) || loopCount <= 0) {
        console.warn("Invalid loopCount provided for benchmarkModularInverse. Using default of 1000.");
        loopCount = 1000;
    }

    let operandCollection = [];
    const collectionSize = 21;
    const effectiveOperationsPerIteration = collectionSize - 1; // 20 modular inverse operations per outer loop iteration

    // Initialize the collection with random large integers, modulo the prime.
    // Ensure that numbers are not zero, as inverse of zero is undefined.
    for (let currentIdx = 0; currentIdx < collectionSize; currentIdx++) {
        let randomBignum;
        do {
            randomBignum = generateRandomBignum(100).applyModulo(PRIME_MODULUS_224);
        } while (randomBignum.isZero()); // Regenerate if zero to avoid errors during inverse calculation
        operandCollection[currentIdx] = randomBignum;
    }

    const startTimestamp = Date.now();

    for (let currentLoop = 0; currentLoop < loopCount; currentLoop++) {
        let inverseResult; // Variable to store the result of each modular inverse operation

        // Perform modular inverse for each element in the collection (except the last).
        for (let opIdx = 0; opIdx < effectiveOperationsPerIteration; opIdx++) {
            inverseResult = operandCollection[opIdx].computeModularInverse(PRIME_MODULUS_224);
            // The 'inverseResult' is computed but not used further, which is typical for a pure benchmark.
        }
    }

    const endTimestamp = Date.now();
    const durationMs = endTimestamp - startTimestamp;

    const totalOperationsPerformed = loopCount * effectiveOperationsPerIteration;
    return (1000 * durationMs) / totalOperationsPerformed;
}