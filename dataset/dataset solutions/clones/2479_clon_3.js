// This function aims to decompose a given positive integer into its constituent prime factors.
// It effectively provides the prime factorization of the input number.
function obtainPrimeComponents(inputNumberForAnalysis) {
    // Perform an initial validation check for the input value.
    // Prime factorization is typically defined for integers strictly greater than 1.
    if (inputNumberForAnalysis <= 1) {
        // Log a warning for non-standard inputs (0, 1, or negative numbers)
        // and return an empty array, indicating no prime factors were found in this context.
        console.warn(`Warning: Input for prime decomposition should be a positive integer greater than 1. Received: ${inputNumberForAnalysis}. Returning an empty list.`);
        return [];
    }

    // Initialize the current number being processed, which will be progressively divided.
    let mutableTargetValue = inputNumberForAnalysis;
    // Start checking for divisibility from the smallest prime number.
    let currentTestDivisor = 2;
    // An array to store all the prime factors discovered during the process.
    const discoveredFactorsCollection = [];

    // Continue the factorization process as long as there's a remaining value to factor.
    // The loop terminates when `mutableTargetValue` becomes 1, signifying complete factorization.
    while (mutableTargetValue > 1) {
        // Check if the `currentTestDivisor` perfectly divides the `mutableTargetValue`.
        if (mutableTargetValue % currentTestDivisor === 0) {
            // If it divides, then `currentTestDivisor` is a prime factor.
            // Add this factor to our collection.
            discoveredFactorsCollection.push(currentTestDivisor);
            // Update `mutableTargetValue` by dividing it by the factor found.
            // This allows us to continue factoring the reduced number.
            mutableTargetValue /= currentTestDivisor;
            // No increment to `currentTestDivisor` here, as the same prime factor
            // might divide `mutableTargetValue` multiple times (e.g., for 12, 2*2*3).
        } else {
            // If the current divisor does not divide the target, move to the next potential divisor.
            currentTestDivisor++;
            // An additional optimization: After checking 2, we can skip all subsequent even numbers
            // as they cannot be prime factors (unless they are 2 themselves, which is handled).
            if (currentTestDivisor > 2 && currentTestDivisor % 2 === 0) {
                currentTestDivisor++; // Increment again to skip to the next odd number.
            }
        }

        // Performance optimization: If the square of the `currentTestDivisor`
        // exceeds the `mutableTargetValue`, and `mutableTargetValue` is still greater than 1,
        // it implies that the remaining `mutableTargetValue` itself must be a prime number.
        // Any smaller composite factor would have already been found.
        const squaredDivisorCheck = currentTestDivisor * currentTestDivisor;
        if (squaredDivisorCheck > mutableTargetValue && mutableTargetValue > 1) {
            // Add the remaining prime number to the collection.
            discoveredFactorsCollection.push(mutableTargetValue);
            // All prime factors have been identified, so exit the loop.
            break;
        }
    }
    // Return the comprehensive list of prime factors.
    return discoveredFactorsCollection;
}

// This function serves as the primary entry point for processing input data
// and executing a specific mathematical calculation, likely related to geometry.
function executeMainCalculation(rawInputString) {
    // Implement robust input string validation to prevent errors from empty or invalid data.
    if (!rawInputString || typeof rawInputString !== 'string' || rawInputString.trim() === '') {
        console.error("Error: The provided input string for calculation is empty or invalid.");
        return; // Terminate execution if input is not usable.
    }

    // Split the raw input string into individual lines.
    // Use a filter to remove any empty lines that might result from trailing newlines or multiple consecutive newlines.
    const processedInputLines = rawInputString.split('\n').filter(lineContent => lineContent.trim() !== '');

    // Ensure that at least one meaningful line of input exists after processing.
    if (processedInputLines.length === 0) {
        console.error("Error: No valid data lines found in the input after cleaning.");
        return;
    }

    // The first line is expected to contain the critical parameters, separated by spaces.
    const parameterSegments = processedInputLines[0].split(' ');

    // Validate the count of parameters. We expect exactly three numeric values.
    if (parameterSegments.length < 3) {
        console.error(`Error: Insufficient parameters. Expected 3 numeric values, but found ${parameterSegments.length}.`);
        return;
    }

    // Define a helper function to safely parse string tokens into numbers.
    // This adds a layer of error handling for non-numeric inputs.
    const parseNumberSafely = (tokenValue, parameterName) => {
        const numericValue = Number(tokenValue); // Convert string to number.
        if (isNaN(numericValue)) {
            // Throw an error if the conversion results in NaN (Not-a-Number).
            throw new Error(`Invalid numeric input for ${parameterName}: "${tokenValue}" is not a valid number.`);
        }
        return numericValue;
    };

    let dimensionA_val, dimensionB_val, constraintX_val;
    try {
        // Attempt to parse the three required parameters.
        // Using distinct variable names for clarity in the cloned code.
        dimensionA_val = parseNumberSafely(parameterSegments[0], 'dimensionA');
        dimensionB_val = parseNumberSafely(parameterSegments[1], 'dimensionB');
        constraintX_val = parseNumberSafely(parameterSegments[2], 'constraintX');
    } catch (parsingError) {
        console.error(`Input Parsing Error: ${parsingError.message}`);
        return; // Exit if any parsing fails.
    }

    // Implement specific guard clauses for the calculation's domain.
    // Division by zero must be prevented.
    if (constraintX_val === 0) {
        console.error("Calculation Error: The parameter 'constraintX' cannot be zero as it serves as a divisor.");
        return;
    }
    // For geometric interpretations, dimensions are typically non-negative.
    if (dimensionA_val < 0 || dimensionB_val < 0) {
        console.warn("Warning: Negative values for geometric dimensions (A or B) might lead to unexpected results, though calculation will proceed.");
    }

    // Break down the complex calculation into intermediate, named steps for better readability and debugging.
    // First, calculate the numerator part of the arctangent argument.
    const numeratorExpression = dimensionA_val * dimensionB_val * dimensionB_val;
    // Next, calculate the denominator part of the arctangent argument.
    const denominatorExpression = constraintX_val * 2;
    // Now, compute the argument for the Math.atan function.
    const tangentRatioArgument = numeratorExpression / denominatorExpression;

    // Calculate the angle in radians using the arctangent function.
    const angleInRadiansResult = Math.atan(tangentRatioArgument);

    // Define the conversion factor from radians to degrees.
    const RADIANS_TO_DEGREES_FACTOR = 180 / Math.PI;
    // Convert the calculated angle from radians to degrees.
    const finalAngleInDegreesResult = angleInRadiansResult * RADIANS_TO_DEGREES_FACTOR;

    // Output the final computed angle to the standard console.
    console.log(finalAngleInDegreesResult);
}

// This section ensures the script can be run in a Node.js environment,
// reading input from standard input and passing it to the main processing function.
// Do not modify the following line in production environments if standard input reading is required.
executeMainCalculation(require("fs").readFileSync("/dev/stdin", "utf8"));