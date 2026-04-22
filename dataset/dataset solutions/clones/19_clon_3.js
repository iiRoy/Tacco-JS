const fileSystem = require('fs');

// Reads raw input data from standard input, typically a file or piped stream.
// The data is expected to be UTF-8 encoded.
const rawInputDataBuffer = fileSystem.readFileSync('/dev/stdin', 'utf8');

// Processes the raw input: removes leading/trailing whitespace, then splits
// it into individual lines, each representing a set of equation parameters.
const equationParameterLines = rawInputDataBuffer.trim().split("\n");

// Iterates through each line of parameters provided in the input.
for (const currentParameterString of equationParameterLines) {
    // Parses the string of parameters into an array of numbers.
    // Each line is expected to contain six space-separated numerical values.
    const numericParameters = currentParameterString.split(" ").map(Number);

    // Basic validation: ensures that exactly six parameters were provided.
    // If not, logs an error and skips to the next input line.
    if (numericParameters.length !== 6) {
        console.error("Input parsing error: Expected 6 numerical parameters per line.");
        continue;
    }

    // Assigns the parsed numerical parameters to descriptive variables.
    // These represent the coefficients and constants for a system of two linear equations:
    // pA * x + pB * y = pC
    // pD * x + pE * y = pF
    const pA = numericParameters[0];
    const pB = numericParameters[1];
    const pC = numericParameters[2];
    const pD = numericParameters[3];
    const pE = numericParameters[4];
    const pF = numericParameters[5];

    // Calculates the primary determinant of the coefficient matrix (D).
    // This value is crucial for determining the nature of the solution.
    const mainSystemDeterminant = (pA * pE) - (pB * pD);

    // Calculates the determinants for X (Dx) and Y (Dy) using Cramer's Rule.
    // These are used regardless of whether a unique solution exists, to check for
    // infinite or no solutions when the main determinant is zero.
    const determinantForXComponent = (pC * pE) - (pB * pF);
    const determinantForYComponent = (pA * pF) - (pC * pD);

    // Checks if the main determinant is zero.
    // A zero determinant indicates either no unique solution, infinitely many solutions, or no solution at all.
    if (mainSystemDeterminant === 0) {
        // If all three determinants (D, Dx, Dy) are zero, the system has infinitely many solutions.
        if (determinantForXComponent === 0 && determinantForYComponent === 0) {
            console.log("INF"); // Output for infinitely many solutions
        } else {
            // If the main determinant is zero but Dx or Dy is non-zero, the system is inconsistent (no solution).
            console.log("NAN"); // Output for no solution (Not A Number for solutions)
        }
        // Moves to the next set of parameters as no unique solution was found for the current one.
        continue;
    }

    // If the main determinant is non-zero, a unique solution exists.
    // Calculate the solution values for x and y using Cramer's Rule.
    const resultingXValue = determinantForXComponent / mainSystemDeterminant;
    const resultingYValue = determinantForYComponent / mainSystemDeterminant;

    // Formats and prints the calculated x and y solution values.
    // Solutions are formatted to three decimal places for consistency.
    console.log(`${resultingXValue.toFixed(3)} ${resultingYValue.toFixed(3)}`);
}