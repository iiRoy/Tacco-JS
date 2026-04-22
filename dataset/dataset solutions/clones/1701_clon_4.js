function normalizeModuloResult(numericValue, modulusConstant) {
    let resultValue = numericValue % modulusConstant;
    if (resultValue < 0) {
        resultValue += modulusConstant;
    }
    return resultValue;
}

function calculateProductModulo(firstFactor, secondFactor, modulusConstant, splitMultiplier) {
    // Uses Math.trunc for integer division matching original's bitwise OR (b / C2 | 0)
    let quotientPart = Math.trunc(secondFactor / splitMultiplier);
    let remainderPart = secondFactor - (quotientPart * splitMultiplier);

    // Calculate (firstFactor * quotientPart * splitMultiplier) % modulusConstant
    let termOne = (firstFactor * quotientPart) % modulusConstant;
    termOne = (termOne * splitMultiplier) % modulusConstant;

    // Calculate (firstFactor * remainderPart)
    let termTwo = (firstFactor * remainderPart);

    // Sum and apply final modulo. The sum could be negative or large.
    let finalSum = termOne + termTwo;
    return normalizeModuloResult(finalSum, modulusConstant);
}

function processInputData(rawData) {
    const MOD_CONST = 1000000007; // Equivalent to 1e9 + 7
    const INTERMEDIATE_SPLIT_FACTOR = 100000; // Equivalent to 1e5

    let parsedLines = rawData.trim().split("\n").map(line => line.split(" ").map(Number));
    let totalElements = parsedLines[0][0]; // N from original
    let selectionSize = parsedLines[0][1]; // K from original
    let sourceNumbers = parsedLines[1]; // vec_A from original

    let positiveValues = [];
    let negativeValues = [];
    let zeroIsPresent = false;

    for (let num of sourceNumbers) {
        if (num > 0) {
            positiveValues.push(num);
        } else if (num < 0) {
            negativeValues.push(num);
        } else {
            zeroIsPresent = true;
        }
    }

    // Sort positive values in descending order
    positiveValues.sort((a, b) => b - a);
    // Sort negative values in ascending order (so largest absolute values come first)
    negativeValues.sort((a, b) => a - b);

    // Special case: if K is 0, the product is 1
    if (selectionSize === 0) {
        return 1;
    }

    let maxLogAbsProduct = -Infinity;
    let resultingSign = 0; // 1 for positive, -1 for negative
    let bestNegativeCount = -1;
    let bestPositiveCount = -1;

    // Iterate through all possible counts of negative numbers to include
    for (let currentNegativeCount = 0; currentNegativeCount <= selectionSize; currentNegativeCount++) {
        let currentPositiveCount = selectionSize - currentNegativeCount;

        // Skip if not enough positive or negative numbers available
        if (currentNegativeCount > negativeValues.length || currentPositiveCount > positiveValues.length) {
            continue;
        }

        let currentLogAbs = 0;
        let currentProductSign = (currentNegativeCount % 2 === 0) ? 1 : -1;

        // Calculate log of absolute product for comparison
        for (let i = 0; i < currentNegativeCount; i++) {
            currentLogAbs += Math.log(Math.abs(negativeValues[i]));
        }
        for (let i = 0; i < currentPositiveCount; i++) {
            currentLogAbs += Math.log(positiveValues[i]);
        }

        // Compare current combination with the best found so far
        if (bestNegativeCount === -1) { // First valid combination
            maxLogAbsProduct = currentLogAbs;
            resultingSign = currentProductSign;
            bestNegativeCount = currentNegativeCount;
            bestPositiveCount = currentPositiveCount;
        } else {
            if (currentProductSign === 1 && resultingSign === -1) { // New product is positive, old was negative -> new is better
                maxLogAbsProduct = currentLogAbs;
                resultingSign = currentProductSign;
                bestNegativeCount = currentNegativeCount;
                bestPositiveCount = currentPositiveCount;
            } else if (currentProductSign === -1 && resultingSign === 1) { // New product is negative, old was positive -> old is better, do nothing
                // Do nothing
            } else if (currentProductSign === 1 && resultingSign === 1) { // Both positive
                if (currentLogAbs > maxLogAbsProduct) {
                    maxLogAbsProduct = currentLogAbs;
                    bestNegativeCount = currentNegativeCount;
                    bestPositiveCount = currentPositiveCount;
                }
            } else { // Both negative
                // For negative products, larger absolute value means smaller (more negative) product.
                // We want the largest negative product (closest to zero), so smallest absolute value.
                if (currentLogAbs < maxLogAbsProduct) {
                    maxLogAbsProduct = currentLogAbs;
                    bestNegativeCount = currentNegativeCount;
                    bestPositiveCount = currentPositiveCount;
                }
            }
        }
    }

    // After determining the best combination:
    // If the best product found is negative, and there's a zero available, then 0 is the true maximum.
    if (resultingSign === -1 && zeroIsPresent) {
        return normalizeModuloResult(0, MOD_CONST);
    }

    // Calculate the actual product using modular arithmetic for the best combination
    let finalAccumulatedProduct = 1;
    for (let i = 0; i < bestNegativeCount; i++) {
        finalAccumulatedProduct = calculateProductModulo(finalAccumulatedProduct, negativeValues[i], MOD_CONST, INTERMEDIATE_SPLIT_FACTOR);
    }
    for (let i = 0; i < bestPositiveCount; i++) {
        finalAccumulatedProduct = calculateProductModulo(finalAccumulatedProduct, positiveValues[i], MOD_CONST, INTERMEDIATE_SPLIT_FACTOR);
    }

    return finalAccumulatedProduct;
}

console.log(processInputData(require("fs").readFileSync("/dev/stdin", "utf8")));