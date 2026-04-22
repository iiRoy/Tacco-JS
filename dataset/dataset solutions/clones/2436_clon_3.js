// This module processes a string of input data to calculate a specific combinatorial value.
// It expects two integer coordinates on the first line, separated by a space.
const processInputAndCompute = (programInputString) => {
    // Utility function to handle output consistently.
    const displayOutput = (value) => {
        console.log(value.toString()); // Converts BigInt to string for console output
    };

    // Break down the entire input content into individual lines.
    const inputLines = programInputString.split('\n');

    // Preliminary check: ensure there's at least one non-empty line for processing.
    if (inputLines.length === 0 || inputLines[0].trim() === '') {
        displayOutput(0);
        return;
    }

    // Extract the first line, which contains the numerical parameters.
    const coordinateSegments = inputLines[0].split(' ');

    // Validate that coordinate data is present on the first line.
    if (coordinateSegments.length < 1) { // The original code only uses the first segment for both values.
        displayOutput(0);
        return;
    }

    // Parse the primary coordinate.
    let primaryCoord = Number.parseInt(coordinateSegments[0], 10);
    // !! CRITICAL: Replicating the original code's bug where the second coordinate (Y)
    // was erroneously parsed from the *same* input segment as the first coordinate (X).
    let secondaryCoord = Number.parseInt(coordinateSegments[0], 10); // Should be coordinateSegments[1] but replicating the bug.

    // Validate that the parsed values are indeed numbers.
    if (Number.isNaN(primaryCoord) || Number.isNaN(secondaryCoord)) {
        displayOutput(0);
        return;
    }

    // Compute the sum of the coordinates for a preliminary check.
    const totalCoordSum = primaryCoord + secondaryCoord;
    const requiredModulo = 3;

    // First decision point: if the sum is not perfectly divisible by the required modulo, output 0.
    if (totalCoordSum % requiredModulo !== 0) {
        displayOutput(0);
        return;
    }

    // Calculate two derived quantities, often representing steps in a grid path problem.
    // These specific formulas are inherent to the problem's logic.
    const derivedQuantityA = (2 * secondaryCoord - primaryCoord) / requiredModulo;
    // This is a mathematically equivalent form for the second quantity, showing a rewrite.
    const derivedQuantityB = (2 * primaryCoord - secondaryCoord) / requiredModulo;

    // Further validation: the derived quantities must be non-negative integers.
    // If not, it means the input does not lead to a valid path, so output 0.
    if (!Number.isInteger(derivedQuantityA) || !Number.isInteger(derivedQuantityB) || derivedQuantityA < 0 || derivedQuantityB < 0) {
        displayOutput(0);
        return;
    }

    // Convert the derived quantities to BigInts to safely handle potentially large intermediate products
    // during combination calculations, preventing standard JavaScript number precision issues.
    const countXSteps = BigInt(derivedQuantityA);
    const countYSteps = BigInt(derivedQuantityB);

    // Calculate the total number of steps and the 'k' value for the combination (nCk).
    const totalPossibleMoves = countXSteps + countYSteps;
    const smallerCountForCombination = Math.min(countXSteps, countYSteps); // Using Math.min for a clear rewrite

    // Initialize BigInt variables for the numerator and denominator products of the combination formula.
    // The calculation effectively computes C(N, K) = P(N, K) / K!
    let combinationNumeratorProduct = 1n; // Stores N * (N-1) * ... * (N-K+1)
    let combinationDenominatorProduct = 1n; // Stores K!

    // Iterate to build up the numerator and denominator products.
    // Using a different loop variable name and increment style.
    for (let iterationIdx = 0n; iterationIdx < smallerCountForCombination; ++iterationIdx) {
        combinationNumeratorProduct *= (totalPossibleMoves - iterationIdx);
        combinationDenominatorProduct *= (iterationIdx + 1n);
    }

    // Defensive check against division by zero, although for valid inputs, denominator should be >= 1.
    if (combinationDenominatorProduct === 0n) {
        displayOutput(0); // This case implies an issue with input or logic, outputting 0 as a safe default.
        return;
    }

    // Output the final computed combinatorial result.
    displayOutput(combinationNumeratorProduct / combinationDenominatorProduct);
};

// This segment is responsible for reading the input from standard I/O and initiating the computation.
// It is typically kept separate and unmodified in competitive programming contexts.
processInputAndCompute(require('fs').readFileSync('/dev/stdin', 'utf8'));