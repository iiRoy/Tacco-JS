const DecimalFormatter = (function() {
    'use strict';

    /**
     * Transforms a floating-point number into a string representation with a specified number of decimal digits.
     * This function handles rounding and ensures proper padding for the fractional component.
     *
     * @param {number} inputNumericValue - The floating-point number to be formatted.
     * @param {number} desiredDecimalPlaces - The exact count of digits required after the decimal point. Must be a non-negative integer.
     * @returns {string} The formatted string, e.g., "123.456" for an input of 123.4567 and 3 decimal places.
     */
    const convertToFixedDecimalString = function(inputNumericValue, desiredDecimalPlaces) {
        // Validate input for decimal places
        if (typeof desiredDecimalPlaces !== 'number' || !Number.isInteger(desiredDecimalPlaces) || desiredDecimalPlaces < 0) {
            console.warn("Invalid or negative 'desiredDecimalPlaces' provided. Defaulting to zero.");
            desiredDecimalPlaces = 0;
        }

        // Handle non-numeric or infinite inputs gracefully
        if (typeof inputNumericValue !== 'number' || !Number.isFinite(inputNumericValue)) {
            return String(inputNumericValue); // Return 'NaN', 'Infinity', '-Infinity' as-is
        }

        // Calculate the multiplier to shift the decimal point for rounding
        const decimalShiftFactor = 10 ** desiredDecimalPlaces;
        // Round the number to the desired precision and convert to string
        const roundedNumberString = String(Math.round(inputNumericValue * decimalShiftFactor));

        // Special case: if the rounded value is zero, return "0.00..."
        if (roundedNumberString === '0') {
            return `0.${'0'.repeat(desiredDecimalPlaces)}`;
        }

        // Determine the effective length of the integer part in the rounded string
        const effectiveIntegerLength = roundedNumberString.length - desiredDecimalPlaces;

        // If the integer part is zero or negative (e.g., 0.123 with 3 places -> "123")
        if (effectiveIntegerLength <= 0) {
            // Calculate necessary leading zeros for the fractional part
            const prefixZeros = '0'.repeat(1 - effectiveIntegerLength);
            return `0.${prefixZeros}${roundedNumberString}`;
        }

        // Extract integer and fractional parts using string slicing
        const integerSegment = roundedNumberString.slice(0, effectiveIntegerLength);
        const fractionalSegment = roundedNumberString.slice(effectiveIntegerLength);

        // Construct and return the final formatted string
        return `${integerSegment}.${fractionalSegment}`;
    };

    // Public API for the decimal formatting module
    return {
        formatNumericValue: convertToFixedDecimalString
    };
})();


const BasicArithmetic = (function() {
    'use strict';

    /**
     * Calculates the Greatest Common Divisor (GCD) of two non-negative integers using the Euclidean algorithm (iterative).
     *
     * @param {number} operandOne - The first integer.
     * @param {number} operandTwo - The second integer.
     * @returns {number} The GCD of the two input numbers.
     */
    const computeGreatestCommonDivisor = (operandOne, operandTwo) => {
        // Ensure inputs are absolute integer values
        let a = Math.abs(Math.floor(operandOne));
        let b = Math.abs(Math.floor(operandTwo));

        // Iterative Euclidean algorithm
        while (b !== 0) {
            const remainder = a % b;
            a = b;
            b = remainder;
        }
        return a;
    };

    /**
     * Determines the Least Common Multiple (LCM) of two non-negative integers.
     *
     * @param {number} valueX - The first integer.
     * @param {number} valueY - The second integer.
     * @returns {number} The LCM of the two numbers. Returns 0 if either input is 0.
     */
    const findLeastCommonMultiple = (valueX, valueY) => {
        // LCM is 0 if either number is 0
        if (valueX === 0 || valueY === 0) {
            return 0;
        }
        // Formula: LCM(x, y) = |x * y| / GCD(x, y)
        // Using Math.abs to ensure a positive result as per standard LCM definition.
        return Math.abs(valueX * valueY) / computeGreatestCommonDivisor(valueX, valueY);
    };

    /**
     * Computes the square of a given number.
     *
     * @param {number} inputNumber - The number to be squared.
     * @returns {number} The square of the input number.
     */
    const calculateSquare = (inputNumber) => inputNumber * inputNumber;

    // Public API for the arithmetic module
    return {
        getGCD: computeGreatestCommonDivisor,
        getLCM: findLeastCommonMultiple,
        getSquaredValue: calculateSquare
    };
})();


const MainApplicationRunner = (function(environmentGlobal) {
    'use strict';

    // Internal state for managing input data and processing flow
    let bufferedInputElements = [];
    let isComputationCycleActive = false; // Flag to control the processing loop

    /**
     * Provides a standardized way to log messages to the console.
     * Uses spread syntax for arguments instead of .apply().
     * @param {...any} messages - Arguments to pass to console.log.
     */
    const emitOutput = (...messages) => {
        environmentGlobal.console.log(...messages);
    };

    /**
     * Configures and starts listening on the standard input stream.
     * Parses incoming data chunks for integer values.
     */
    const setupInputHandler = () => {
        const primaryInputStream = environmentGlobal.process.openStdin();
        primaryInputStream.setEncoding('utf8');

        primaryInputStream.on('data', (receivedChunk) => {
            // Extract potential integer numbers (including negative) from the chunk
            const detectedNumbers = receivedChunk.match(/[-]?\d+/g);
            if (detectedNumbers && detectedNumbers.length > 0) {
                // Append parsed numbers to the buffer using spread operator
                bufferedInputElements.push(...detectedNumbers);
            }

            // If a computation cycle isn't already running, initiate one
            if (!isComputationCycleActive) {
                beginProcessingLoop();
            }
        });

        primaryInputStream.on('end', () => {
            emitOutput("Input stream has concluded. Finalizing any remaining computations.");
            // The processing loop will naturally terminate when bufferedInputElements is empty.
        });

        primaryInputStream.on('error', (errorDetails) => {
            emitOutput("An error occurred with standard input:", errorDetails.message);
            // Optionally, halt processing or implement more specific error recovery here.
            isComputationCycleActive = false;
        });
    };

    /**
     * Retrieves and parses the next integer from the internal input buffer.
     * Handles potential non-numeric entries by skipping them.
     *
     * @returns {number} The next parsed integer, or NaN if the buffer is empty or only contains invalid entries.
     */
    const extractNextInteger = () => {
        if (bufferedInputElements.length === 0) {
            emitOutput("Warning: Attempted to read from an empty input buffer.");
            return NaN; // Indicates no more data or an unexpected read attempt
        }

        // Use shift() for removing and returning the first element
        const tokenString = bufferedInputElements.shift();
        const parsedInteger = parseInt(tokenString, 10);

        if (isNaN(parsedInteger)) {
            emitOutput(`Notice: Skipping invalid input token '${tokenString}'.`);
            // Recursively try to get the next valid integer
            return extractNextInteger();
        }
        return parsedInteger;
    };

    /**
     * Checks if there are any remaining elements in the input buffer.
     *
     * @returns {boolean} True if more input elements are available, false otherwise.
     */
    const hasPendingInput = () => bufferedInputElements.length > 0;

    /**
     * Executes a single iteration of the main calculation logic.
     * It fetches two numbers, computes their GCD and LCM, and outputs the results.
     */
    const performSingleCalculation = () => {
        // If no more input is available, stop the processing cycle
        if (!hasPendingInput()) {
            isComputationCycleActive = false;
            return;
        }

        let firstValue, secondValue;
        try {
            // Fetch two numbers as per the original problem's requirement
            firstValue = extractNextInteger();
            secondValue = extractNextInteger();

            // Validate fetched numbers
            if (isNaN(firstValue) || isNaN(secondValue)) {
                emitOutput("Error: Insufficient valid numbers for a complete calculation. Skipping this cycle.");
                // If there's still input, try the next cycle, even if this one failed
                if (hasPendingInput()) {
                    environmentGlobal.setImmediate(performSingleCalculation);
                } else {
                    isComputationCycleActive = false;
                }
                return;
            }
        } catch (inputError) {
            emitOutput("Critical Error during input extraction:", inputError.message);
            isComputationCycleActive = false; // Halt on critical input error
            return;
        }

        // Perform the GCD and LCM computations using the imported arithmetic functions
        const calculatedGCD = BasicArithmetic.getGCD(firstValue, secondValue);
        const calculatedLCM = BasicArithmetic.getLCM(firstValue, secondValue);

        // Output the computed results
        emitOutput(calculatedGCD, calculatedLCM);

        // Schedule the next calculation if more input data is available
        if (hasPendingInput()) {
            // Using setImmediate for deferring to the next tick in Node.js event loop,
            // which is generally more efficient than setTimeout(fn, 0) for non-I/O tasks.
            environmentGlobal.setImmediate(performSingleCalculation);
        } else {
            isComputationCycleActive = false; // All data processed, stop the loop
        }
    };

    /**
     * Initiates the main application processing sequence.
     * Sets up input handlers and starts the computation loop if not already running.
     */
    const beginProcessingLoop = () => {
        if (!isComputationCycleActive) {
            isComputationCycleActive = true;
            // Defer the first calculation to allow the event loop to process initial I/O.
            environmentGlobal.setImmediate(performSingleCalculation);
        }
    };

    // The public interface for the main application runner
    return {
        // Entry point to start the entire application
        startApplication: () => {
            setupInputHandler(); // Initialize input stream listeners
            // The processing loop will be triggered by incoming data or can be explicitly started here.
            // beginProcessingLoop(); // Uncomment if processing should start immediately even without data
        },
        // Expose the utility modules for potential external use or testing
        utilities: {
            decimalFormatting: DecimalFormatter,
            mathematicalOperations: BasicArithmetic
        }
    };

})(global); // Pass Node.js 'global' object explicitly

// Start the application's main execution flow
MainApplicationRunner.startApplication();