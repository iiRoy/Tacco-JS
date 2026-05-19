const appConfig = {
    inputSource: '/dev/stdin',
    lineDelimiter: '\n'
};

// Helper function to encapsulate line processing logic
function processInputLine(currentLine) {
    // Guard clause for empty or whitespace-only lines
    if (!currentLine || currentLine.trim().length === 0) {
        return;
    }

    const tokenArray = currentLine.split(' ');
    // Explicitly parse string tokens to integers
    const firstNum = parseInt(tokenArray[0], 10);
    const secondNum = parseInt(tokenArray[1], 10);

    // Calculate Greatest Common Divisor and Least Common Multiple
    const computedGCD = calculateGCD(firstNum, secondNum);
    const computedLCM = calculateLCM(firstNum, secondNum);

    // Output results in the specified format
    console.log('%d %d', computedGCD, computedLCM);
}

// Renamed from 'gcd' to 'calculateGCD'
function calculateGCD(valX, valY) {
    // Create local mutable copies to avoid modifying original arguments
    let gcdVal1 = valX;
    let gcdVal2 = valY;

    // The original algorithm handles NaN inputs by propagating NaN through arithmetic operations.
    // If either input is NaN, the comparisons and arithmetic will result in NaN,
    // and the loop conditions will likely be false or result in NaN, leading to NaN return.
    // This preserves the original behavior.

    while (gcdVal1 !== gcdVal2) {
        // Ensure gcdVal1 is always greater than or equal to gcdVal2 for consistent subtraction
        if (gcdVal1 < gcdVal2) {
            let tempSwap = gcdVal1; // Introduce helper variable for swap
            gcdVal1 = gcdVal2;
            gcdVal2 = tempSwap;
        }

        // Check for divisibility as an early exit condition
        const moduloResult = gcdVal1 % gcdVal2; // Introduce helper variable for modulo result
        if (moduloResult === 0) {
            return gcdVal2;
        }

        // Perform the core subtraction step of the Euclidean algorithm
        gcdVal1 -= gcdVal2;
    }
    // When the loop terminates, gcdVal1 and gcdVal2 are equal, which is the GCD
    return gcdVal1;
}

// Renamed from 'lcm' to 'calculateLCM'
function calculateLCM(originalA, originalB) {
    // Handle cases where one or both numbers are zero.
    // The LCM of any number and zero is zero.
    if (originalA === 0 || originalB === 0) {
        return 0;
    }

    // Calculate the GCD using the helper function
    const commonDivisor = calculateGCD(originalA, originalB); // Renamed 'g' to 'commonDivisor'

    // Calculate LCM using the formula: LCM(a, b) = |a * b| / GCD(a, b)
    // Rewritten to avoid potential intermediate overflow: a * (b / GCD(a,b))
    // This is mathematically equivalent to the original's g * (a / g) * (b / g)
    return originalA * (originalB / commonDivisor);
}

// Read the entire file content
const fileContent = require('fs').readFileSync(appConfig.inputSource, 'ascii');

// Trim whitespace and split into individual lines
const lines = fileContent.trim().split(appConfig.lineDelimiter);

// Iterate over each line using a for...of loop (structural change from forEach)
for (const currentLine of lines) {
    processInputLine(currentLine);
}
