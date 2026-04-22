// This script reads coefficients for systems of two linear equations from standard input,
// solves each system, and prints the solutions for X and Y, rounded to three decimal places.

// Import the Node.js file system module for reading input.
const fileSystemModule = require('fs');

// Define a constant for the standard input file path.
const standardInputPath = '/dev/stdin';

// Function to safely parse a string into a floating-point number.
// Includes a basic validation to ensure it's a valid number.
function parseInputCoefficient(inputString) {
    const parsedValue = parseFloat(inputString);
    if (isNaN(parsedValue)) {
        // In a robust application, error handling would be more sophisticated.
        // For this context, we'll return 0.0 or handle as per problem spec.
        // Assuming valid numerical input for competitive programming.
        return 0.0;
    }
    return parsedValue;
}

// Function to solve a 2x2 system of linear equations:
// A1*x + B1*y = C1
// A2*x + B2*y = C2
// Returns an object { solutionX, solutionY } or null if no unique solution exists.
function determineSystemSolution(firstCoeffX, firstCoeffY, firstConstant,
                                  secondCoeffX, secondCoeffY, secondConstant) {
    // Calculate the determinant of the coefficient matrix.
    // D = A1*B2 - B1*A2
    const mainDeterminant = (firstCoeffX * secondCoeffY) - (firstCoeffY * secondCoeffX);

    // Check for cases where there is no unique solution (determinant is zero).
    // This implies either no solution (parallel lines) or infinite solutions (same line).
    // Using a small epsilon for floating point comparison to account for precision issues.
    if (Math.abs(mainDeterminant) < 1e-9) {
        return null; // No unique solution found
    }

    // Calculate determinants for X and Y using Cramer's Rule.
    // Dx = C1*B2 - B1*C2
    const determinantX = (firstConstant * secondCoeffY) - (firstCoeffY * secondConstant);
    // Dy = A1*C2 - C1*A2
    const determinantY = (firstCoeffX * secondConstant) - (firstConstant * secondCoeffX);

    // Calculate the solutions for X and Y.
    const resultX = determinantX / mainDeterminant;
    const resultY = determinantY / mainDeterminant;

    return { solutionX: resultX, solutionY: resultY };
}

// Function to format a numerical result to three decimal places,
// replicating the specific rounding behavior of the original code (Math.round).
function formatOutputValue(numericalValue) {
    // Multiply by 1000, round to the nearest integer, then divide by 1000.
    const intermediateRoundedValue = Math.round(numericalValue * 1000) / 1000;
    // Use toFixed(3) to ensure exactly three decimal places, padding with zeros if necessary.
    return intermediateRoundedValue.toFixed(3);
}

// Read the entire content of the standard input file.
// The 'utf8' encoding ensures it's read as a string.
const rawInputContent = fileSystemModule.readFileSync(standardInputPath, 'utf8');

// Process the raw input: remove leading/trailing whitespace and split into tokens
// by any sequence of whitespace characters (spaces, tabs, newlines).
const inputTokens = rawInputContent.trim().split(/\s+/);

// Initialize an index to keep track of the current token being processed.
let currentTokenReadIndex = 0;

// Loop through the input tokens, processing them in sets of six.
// Each set represents the coefficients (A1, B1, C1, A2, B2, C2) for one system of equations.
while (currentTokenReadIndex + 5 < inputTokens.length) { // Ensure there are at least 6 tokens left to read
    // Extract and parse the six coefficients for the current system.
    const firstEquationCoeffA = parseInputCoefficient(inputTokens[currentTokenReadIndex++]);
    const firstEquationCoeffB = parseInputCoefficient(inputTokens[currentTokenReadIndex++]);
    const firstEquationConstantC = parseInputCoefficient(inputTokens[currentTokenReadIndex++]);
    const secondEquationCoeffD = parseInputCoefficient(inputTokens[currentTokenReadIndex++]);
    const secondEquationCoeffE = parseInputCoefficient(inputTokens[currentTokenReadIndex++]);
    const secondEquationConstantF = parseInputCoefficient(inputTokens[currentTokenReadIndex++]);

    // Solve the system of linear equations using the extracted coefficients.
    const calculatedSolutions = determineSystemSolution(
        firstEquationCoeffA, firstEquationCoeffB, firstEquationConstantC,
        secondEquationCoeffD, secondEquationCoeffE, secondEquationConstantF
    );

    // Check if a unique solution was successfully found.
    if (calculatedSolutions !== null) {
        // Format the calculated X and Y solutions.
        const formattedXValue = formatOutputValue(calculatedSolutions.solutionX);
        const formattedYValue = formatOutputValue(calculatedSolutions.solutionY);

        // Print the formatted solutions to standard output, separated by a space.
        console.log(`${formattedXValue} ${formattedYValue}`);
    } else {
        // If no unique solution was found (e.g., determinant was zero),
        // output a default "0.000 0.000" as a placeholder or error indication.
        // This handles cases where the original code might output "NaN" or "Infinity".
        console.log("0.000 0.000");
    }
}