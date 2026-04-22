let receivedDataBuffer = ''; // Buffer to accumulate all incoming data from standard input.

// Resume the standard input stream to ensure data is processed.
process.stdin.resume();

// Set the character encoding for the standard input stream to UTF-8.
process.stdin.setEncoding('utf8');

// Event listener for 'data' chunks received from standard input.
// Each incoming data segment is appended to our buffer.
process.stdin.on('data', function(dataSegment) {
  receivedDataBuffer += dataSegment;
});

// Event listener for the 'end' of the standard input stream.
// Once all data has been received, the processing logic is initiated.
process.stdin.on('end', function() {
  // Split the accumulated data into individual lines.
  // Filter out any empty lines that might result from trailing newlines or multiple newlines.
  const parsedInputLines = receivedDataBuffer.split('\n').filter(line => line.trim() !== '');
  
  // Call the main function to process the parsed lines.
  solveSystemOfEquationsFromInput(parsedInputLines);
});

/**
 * Processes an array of input lines, where each line contains coefficients
 * for a system of two linear equations (ax + by = c, dx + ey = f).
 * It calculates and prints the solutions (x, y) for each system.
 *
 * @param {string[]} inputLines An array of strings, each representing a line
 *                              of space-separated numerical coefficients.
 */
function solveSystemOfEquationsFromInput(inputLines) {
    // Constant for defining the desired number of decimal places for the output solutions.
    const SOLUTION_DECIMAL_PRECISION = 3;

    // Iterate through each provided line of input.
    for (let lineIndex = 0; lineIndex < inputLines.length; ++lineIndex) {
        const currentInputLine = inputLines[lineIndex];

        // Attempt to parse the space-separated values on the current line into numbers.
        const numericalCoefficients = currentInputLine.split(' ').map(Number);

        // --- Robust Input Validation ---
        // Check if the line has exactly 6 numerical coefficients and if they are all valid finite numbers.
        if (
            numericalCoefficients.length !== 6 ||
            numericalCoefficients.some(isNaN) ||
            numericalCoefficients.some(val => !Number.isFinite(val))
        ) {
            console.error(`Validation Error: Line ${lineIndex + 1} ("${currentInputLine}") is malformed. Expected 6 finite numbers. Skipping.`);
            continue; // Skip processing this line and move to the next.
        }

        // Destructure the array of numbers into named coefficients for clarity.
        // The equations are:
        // coeffA * x + coeffB * y = constC
        // coeffD * x + coeffE * y = constF
        const [coeffA, coeffB, constC, coeffD, coeffE, constF] = numericalCoefficients;

        // Calculate the determinant of the coefficient matrix.
        // This value is crucial for determining if a unique solution exists.
        // Denominator for Cramer's rule is (a*e - b*d). The original code used (d*b - a*e),
        // which is equivalent to -(a*e - b*d). We'll use the original's form for consistency
        // with its numerators.
        const systemDeterminant = (coeffD * coeffB - coeffA * coeffE);

        // --- Singularity Check ---
        // If the system determinant is zero, the system either has no unique solution
        // (lines are parallel and distinct) or infinitely many solutions (lines are coincident).
        if (systemDeterminant === 0) {
            console.log(`Line ${lineIndex + 1}: System has no unique solution (determinant is zero).`);
            continue; // Skip to the next input line as a unique solution cannot be found.
        }

        // Calculate the numerator for 'x' using Cramer's rule.
        // Numerator for x: (b*f - e*c)
        const numeratorForSolutionX = (coeffB * constF - coeffE * constC);
        const solutionX = numeratorForSolutionX / systemDeterminant;

        let solutionY;
        // The original code calculated 'y' using (c - a*x) / b.
        // This is efficient but requires 'b' not to be zero.
        // We add a check for 'coeffB' being zero to ensure robustness.
        if (coeffB === 0) {
            // If coeffB is zero, the first equation is coeffA * x = constC.
            // In this specific case, using Cramer's rule for y is safer.
            // Numerator for y: (a*f - d*c)
            const numeratorForSolutionY_Cramer = (coeffA * constF - coeffD * constC);
            // Note: The denominator here is (a*e - d*b), which is -systemDeterminant.
            // To align with systemDeterminant, we need to adjust the numerator sign.
            // Original x formula: (b*f - e*c) / (d*b - a*e)
            // If we use Cramer's for y: (a*f - d*c) / (a*e - d*b)
            // To use systemDeterminant = (d*b - a*e), we need -(a*f - d*c).
            solutionY = -numeratorForSolutionY_Cramer / systemDeterminant;
        } else {
            // If coeffB is not zero, the original formula for 'y' is perfectly valid.
            solutionY = (constC - coeffA * solutionX) / coeffB;
        }
        
        // Output the calculated solutions, formatted to the specified decimal precision.
        // A dedicated helper function ensures consistent output formatting.
        displayFormattedSolutions(solutionX, solutionY, SOLUTION_DECIMAL_PRECISION);
    }
}

/**
 * Helper function to print two numerical values, each formatted to a specific
 * number of decimal places, separated by a space.
 *
 * @param {number} value1 The first number to be formatted and displayed.
 * @param {number} value2 The second number to be formatted and displayed.
 * @param {number} precision The number of decimal places to which the values should be fixed.
 */
function displayFormattedSolutions(value1, value2, precision) {
    const formattedValue1 = value1.toFixed(precision);
    const formattedValue2 = value2.toFixed(precision);
    console.log(formattedValue1, formattedValue2);
}