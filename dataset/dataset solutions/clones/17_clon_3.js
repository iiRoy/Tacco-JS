const fileSystem = require('fs'); // Core module for file system operations, used to read standard input.

// Read all incoming data from the standard input stream.
// The data is assumed to be UTF-8 encoded text.
const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');

// Process the raw input content into an array of individual lines.
// Any truly empty lines (e.g., from multiple newlines or trailing newline) are filtered out.
const inputDataLines = rawInputContent.split('\n').filter(Boolean);

/**
 * Computes the solutions (x, y) for a given system of two linear equations:
 *   equation1: A_coeff * x + B_coeff * y = C_const
 *   equation2: D_coeff * x + E_coeff * y = F_const
 * This function employs an algebraic elimination method similar to Gaussian elimination
 * to find the values of x and y.
 *
 * @param {number} A_coeff - The 'A' coefficient from the first equation.
 * @param {number} B_coeff - The 'B' coefficient from the first equation.
 * @param {number} C_const - The constant 'C' from the first equation.
 * @param {number} D_coeff - The 'D' coefficient from the second equation.
 * @param {number} E_coeff - The 'E' coefficient from the second equation.
 * @param {number} F_const - The constant 'F' from the second equation.
 * @returns {{xValue: number, yValue: number}} An object containing the computed x and y values.
 * @throws {Error} If the system is ill-conditioned or unsolvable by this method (e.g., division by zero).
 */
function solveLinearSystem(A_coeff, B_coeff, C_const, D_coeff, E_coeff, F_const) {
    // A preliminary check for degenerate cases where E_coeff is zero.
    // In such a scenario, the elimination strategy might need adjustment or a different method.
    // The original code implicitly handled this by producing NaN/Infinity, which we will allow to propagate
    // unless it leads to a clear "inconsistent" state.
    if (E_coeff === 0) {
        // If B_coeff is also zero, the first equation is A_coeff * x = C_const.
        // If D_coeff is also zero, the second equation is 0 = F_const.
        if (D_coeff === 0 && F_const !== 0) {
            throw new Error("System is inconsistent (0 = non-zero constant in second equation).");
        }
        // If B_coeff is zero, the first equation is A_coeff * x = C_const.
        // If A_coeff is also zero, it's 0 = C_const.
        if (A_coeff === 0 && C_const !== 0) {
            throw new Error("System is inconsistent (0 = non-zero constant in first equation).");
        }
        // For other cases where E_coeff is zero, the current elimination strategy will produce
        // Infinity or NaN, similar to the original's implicit behavior.
    }

    // Determine a scaling factor to eliminate the 'y' term when combining equations.
    // This factor is derived by multiplying the second equation such that its 'y' coefficient
    // becomes the negative of the first equation's 'y' coefficient (B_coeff).
    // Specifically, if second equation is D_coeff*x + E_coeff*y = F_const,
    // we want E_coeff * scale_factor = -B_coeff, so scale_factor = -B_coeff / E_coeff.
    const yEliminationFactor = -(B_coeff / E_coeff);

    // Apply the scaling factor to the second equation's coefficients and constant.
    // We use new variables to avoid altering the original input coefficients.
    const scaledD_coeff = D_coeff * yEliminationFactor;
    const scaledF_const = F_const * yEliminationFactor;

    // Sum the 'x' coefficients from the first equation and the scaled second equation.
    // This combined coefficient will be used as the denominator for solving 'x'.
    // (A_coeff * x + B_coeff * y) + (scaledD_coeff * x - B_coeff * y) = C_const + scaledF_const
    // (A_coeff + scaledD_coeff) * x = C_const + scaledF_const
    const combinedXTermCoefficient = A_coeff + scaledD_coeff;

    // Guard against division by zero when calculating x.
    // A zero denominator here implies a singular system (either no solution or infinite solutions).
    if (combinedXTermCoefficient === 0) {
        // If also C_const + scaledF_const is 0, it might be infinite solutions. Otherwise, no solution.
        // The original logic would yield Infinity or NaN, so we allow it to propagate.
        throw new Error("System is singular; cannot uniquely determine x (zero denominator).");
    }

    // Calculate the value of x.
    const xValue = (C_const + scaledF_const) / combinedXTermCoefficient;

    // Now, substitute the calculated 'xValue' back into the first equation to solve for 'y'.
    // B_coeff * y = C_const - (A_coeff * xValue)
    // y = (C_const - (A_coeff * xValue)) / B_coeff
    // Guard against division by zero when calculating y.
    if (B_coeff === 0) {
        // If B_coeff is zero, and A_coeff * xValue !== C_const, then the first equation is inconsistent.
        // If A_coeff * xValue === C_const, then y could be anything (infinite solutions).
        // The original logic would yield Infinity or NaN, so we allow it to propagate.
        throw new Error("Cannot determine y uniquely from first equation (B_coeff is zero).");
    }
    const yValue = (C_const - (A_coeff * xValue)) / B_coeff;

    return { xValue, yValue };
}

/**
 * Formats a given numeric value to a string representation with exactly three decimal places.
 * This helper function also handles rounding and ensures consistent decimal presentation.
 *
 * @param {number} numericalResult - The number to be formatted.
 * @returns {string} The formatted string, e.g., "12.345" or "0.000".
 */
function formatNumericalOutput(numericalResult) {
    // The `toFixed(3)` method is used for precision and rounding.
    // It returns a string. Note that `toFixed` can throw a RangeError for NaN/Infinity.
    let formattedOutput = numericalResult.toFixed(3);

    // Some environments or specific calculations can result in '-0.000'.
    // This conditional check ensures a positive zero representation for consistency.
    if (formattedOutput === '-0.000') {
        formattedOutput = '0.000';
    }
    return formattedOutput;
}

// Initialize a counter to iterate through the processed input lines.
let currentLineIndex = 0;

// Loop through each line of the input data until all lines have been processed.
while (currentLineIndex < inputDataLines.length) {
    const activeLineContent = inputDataLines[currentLineIndex++];

    // If a line is unexpectedly empty after initial filtering, skip it.
    if (!activeLineContent.trim()) {
        continue;
    }

    // Parse the current line: split by spaces and convert each segment to a number.
    // The `Number` constructor is used as a parsing function for `map`.
    const parsedCoefficients = activeLineContent.split(' ').map(Number);

    // Define the expected number of coefficients for a 2x2 system.
    const REQUIRED_COEFFICIENT_COUNT = 6;

    // Validate that the correct number of coefficients was parsed.
    if (parsedCoefficients.length !== REQUIRED_COEFFICIENT_COUNT) {
        console.error(`Input Error: Line "${activeLineContent}" has an incorrect number of coefficients. Expected ${REQUIRED_COEFFICIENT_COUNT}, but found ${parsedCoefficients.length}. Skipping this line.`);
        continue; // Move to the next line of input.
    }

    // Use array destructuring to assign the parsed values to meaningful variable names.
    const [A_coeff, B_coeff, C_const, D_coeff, E_coeff, F_const] = parsedCoefficients;

    // Further validation: ensure all parsed values are indeed valid numbers.
    const areAllCoefficientsValid = [A_coeff, B_coeff, C_const, D_coeff, E_coeff, F_const].every(val => typeof val === 'number' && !isNaN(val));

    if (!areAllCoefficientsValid) {
        console.error(`Input Error: Line "${activeLineContent}" contains non-numeric values. Skipping this line.`);
        continue;
    }

    let calculatedSolutions;
    try {
        // Attempt to solve the system of equations using the dedicated function.
        calculatedSolutions = solveLinearSystem(A_coeff, B_coeff, C_const, D_coeff, E_coeff, F_const);
    } catch (systemError) {
        // If an error occurs during solution (e.g., singular system),
        // print a generic error message for the output and proceed to the next line.
        console.log(`ERROR ERROR`);
        // console.error(`System Error for line "${activeLineContent}": ${systemError.message}`); // Optional detailed error to stderr
        continue;
    }

    // Extract the calculated x and y values from the result object.
    const { xValue, yValue } = calculatedSolutions;

    // Format both solution values to the required three decimal places.
    const formattedXOutput = formatNumericalOutput(xValue);
    const formattedYOutput = formatNumericalOutput(yValue);

    // Output the formatted results to standard output, separated by a space.
    // Using `process.stdout.write` for direct output, similar to `console.log` but without automatic newline,
    // so we explicitly add `\n`.
    process.stdout.write(`${formattedXOutput} ${formattedYOutput}\n`);
}