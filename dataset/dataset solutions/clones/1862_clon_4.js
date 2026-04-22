class DataProcessor {
    constructor(sourceContent) {
        this.dataTokens = sourceContent.split(/ |\n/).filter(token => token !== '');
        this.currentTokenIndex = 0;
    }

    fetchInteger() {
        return parseInt(this.dataTokens[this.currentTokenIndex++], 10);
    }

    fetchBigInteger() {
        return BigInt(this.dataTokens[this.currentTokenIndex++]);
    }

    // fetchString, fetchIntegerSeries, fetchMatrix are not used in the original's main logic,
    // so they are omitted for brevity in the clone, focusing on core functionality.
}

const MODULUS_CONSTANT = 1000000007;

function calculateCommonDivisor(valOne, valTwo) {
    valOne = valOne < 0n ? -valOne : valOne;
    valTwo = valTwo < 0n ? -valTwo : valTwo;
    while (valTwo !== 0n) {
        let temporary = valTwo;
        valTwo = valOne % valTwo;
        valOne = temporary;
    }
    return valOne;
}

function applyModularMultiplication(factorA, factorB) {
    // This multiplication is for numbers (up to MODULUS_CONSTANT-1).
    // Direct multiplication can exceed Number.MAX_SAFE_INTEGER (9e15) if factors are ~1e9.
    // Using BigInt for intermediate product prevents overflow, then convert back to Number.
    const product = (BigInt(factorA) * BigInt(factorB)) % BigInt(MODULUS_CONSTANT);
    return Number(product);
}

function computeModularPower(baseValue, exponentValue) {
    let resultAccumulator = 1;
    baseValue %= MODULUS_CONSTANT;
    while (exponentValue > 0) {
        if (exponentValue % 2 === 1) {
            resultAccumulator = applyModularMultiplication(resultAccumulator, baseValue);
        }
        baseValue = applyModularMultiplication(baseValue, baseValue);
        exponentValue = Math.floor(exponentValue / 2);
    }
    return resultAccumulator;
}

function adjustToModulus(valueInput) {
    let processedValue = valueInput % MODULUS_CONSTANT;
    if (processedValue < 0) {
        processedValue += MODULUS_CONSTANT;
    }
    return processedValue;
}

function primaryExecution() {
    const dataSource = new DataProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

    const totalItems = dataSource.fetchInteger();
    let allZeroVectors = 0; // Counts (0,0) vectors
    let zeroXAxisVectors = 0; // Counts (0, Y) vectors where Y != 0
    let zeroYAxisVectors = 0; // Counts (X, 0) vectors where X != 0

    // Map to store frequencies of canonical vector orientations (BigInt -> Map<BigInt, number>)
    const vectorOrientationMap = new Map();

    for (let loopCounter = 0; loopCounter < totalItems; loopCounter++) {
        const inputX = dataSource.fetchBigInteger();
        const inputY = dataSource.fetchBigInteger();

        if (inputX === 0n && inputY === 0n) {
            allZeroVectors++;
            continue;
        }
        if (inputX === 0n) {
            zeroXAxisVectors++;
            continue;
        }
        if (inputY === 0n) {
            zeroYAxisVectors++;
            continue;
        }

        const divisor = calculateCommonDivisor(inputX, inputY);
        let normalizedX = inputX / divisor;
        let normalizedY = inputY / divisor;

        // Canonicalization: ensure the X component is positive
        if (normalizedX < 0n) {
            normalizedX = -normalizedX;
            normalizedY = -normalizedY;
        }

        if (!vectorOrientationMap.has(normalizedX)) {
            vectorOrientationMap.set(normalizedX, new Map());
        }
        const innerMap = vectorOrientationMap.get(normalizedX);
        innerMap.set(normalizedY, (innerMap.get(normalizedY) || 0) + 1);
    }

    // Initialize result with combinations for vectors along axes (these are orthogonal to each other)
    let finalResult = adjustToModulus(
        computeModularPower(2, zeroXAxisVectors) +
        computeModularPower(2, zeroYAxisVectors) -
        1
    );

    // Set to track pairs of orthogonal directions that have already been processed
    const visitedOrthogonalGroups = new Set();

    for (const [currentX, innerFrequencyMap] of vectorOrientationMap.entries()) {
        for (const [currentY, frequencyCount] of innerFrequencyMap.entries()) {
            // Current canonical vector is (currentX, currentY) with 'frequencyCount' occurrences

            // Determine its orthogonal vector (currentY, -currentX)
            let orthogonalX = currentY;
            let orthogonalY = -currentX;

            // Canonicalize the orthogonal vector
            if (orthogonalX < 0n) {
                orthogonalX = -orthogonalX;
                orthogonalY = -orthogonalY;
            }

            // Create unique string identifiers for the current direction and its orthogonal
            const currentDirectionId = `${currentX},${currentY}`;
            const orthogonalDirectionId = `${orthogonalX},${orthogonalY}`;

            // Create a consistent pair identifier by sorting the two direction IDs
            const pairIdentifier = [currentDirectionId, orthogonalDirectionId].sort().join('|');

            if (visitedOrthogonalGroups.has(pairIdentifier)) {
                continue; // This pair has already been processed
            }
            visitedOrthogonalGroups.add(pairIdentifier); // Mark as processed

            const currentDirectionFrequency = frequencyCount;
            let orthogonalDirectionFrequency = 0;

            // Retrieve frequency for the orthogonal direction if it exists
            if (vectorOrientationMap.has(orthogonalX) && vectorOrientationMap.get(orthogonalX).has(orthogonalY)) {
                orthogonalDirectionFrequency = vectorOrientationMap.get(orthogonalX).get(orthogonalY);
            }

            // Calculate the term for this orthogonal pair: (2^k1 + 2^k2 - 1) mod P
            const temporaryValue = adjustToModulus(
                computeModularPower(2, currentDirectionFrequency) +
                computeModularPower(2, orthogonalDirectionFrequency) -
                1
            );
            finalResult = applyModularMultiplication(finalResult, temporaryValue);
        }
    }

    // Final adjustment:
    // Subtract 1 to remove the 'empty set' from the product of combinations.
    // Add 'allZeroVectors' (as per the original problem's specific logic).
    let finalAdjustedResult = adjustToModulus(finalResult - 1 + allZeroVectors);

    return finalAdjustedResult;
}

const programOutput = primaryExecution();
if (programOutput !== undefined) {
    console.log(programOutput);
}