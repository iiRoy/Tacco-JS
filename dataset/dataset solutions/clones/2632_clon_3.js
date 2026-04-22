const calculateGreatestCommonDivisor = (firstNum, secondNum) => {
    // Ensure numbers are non-negative for GCD calculation, as Euclidean algorithm typically
    // operates on non-negative integers. Math.abs handles potential negative inputs.
    let currentA = Math.abs(firstNum);
    let currentB = Math.abs(secondNum);

    // Apply the Euclidean algorithm to find the GCD.
    // The process continues until the remainder (currentB) becomes zero.
    while (currentB !== 0) {
        // Temporarily store the value of currentB
        const temporaryStorage = currentB;
        // Update currentB to be the remainder of currentA divided by currentB
        currentB = currentA % currentB;
        // Update currentA to the value that was previously in currentB (temporaryStorage)
        currentA = temporaryStorage;
    }
    // When the loop terminates, currentA holds the greatest common divisor.
    return currentA;
};

const determineLeastCommonMultiple = (valueAlpha, valueBeta) => {
    // The Least Common Multiple (LCM) of any number and zero is zero.
    if (valueAlpha === 0 || valueBeta === 0) {
        return 0;
    }

    // Calculate the Greatest Common Divisor (GCD) using the helper function.
    // This is essential for computing the LCM efficiently.
    const gcdResult = calculateGreatestCommonDivisor(valueAlpha, valueBeta);

    // Compute the LCM using the formula: LCM(a, b) = |a * b| / GCD(a, b).
    // Using Math.abs ensures the result is non-negative, consistent with LCM definition.
    // The order of operations (multiplication then division) is fine for JavaScript's Number type.
    return Math.abs(valueAlpha * valueBeta) / gcdResult;
};

const processInputData = (rawInputString) => {
    // Split the entire input string into an array of lines.
    // .trim() removes any leading/trailing whitespace from the input string.
    const dataLines = rawInputString.trim().split('\n');

    // --- Input Validation and Parsing ---

    // Check if there are enough lines of input.
    // The problem expects at least two lines: one for count, one for values.
    if (dataLines.length < 2) {
        console.error("Error: Insufficient input lines. Expected at least two lines of data.");
        return; // Exit function early if input is invalid.
    }

    // Parse the first line to get the total number of elements expected.
    // parseInt with radix 10 ensures correct integer parsing.
    const totalElementsExpected = parseInt(dataLines[0], 10);

    // Validate the parsed count to ensure it's a valid positive integer.
    if (isNaN(totalElementsExpected) || totalElementsExpected <= 0) {
        console.error(`Error: Invalid or non-positive element count provided: '${dataLines[0]}'.`);
        return;
    }

    // Split the second line into an array of raw numeric strings using space as a delimiter.
    const rawNumericStrings = dataLines[1].split(' ');

    // Validate if the number of parsed string values matches the expected count.
    if (rawNumericStrings.length !== totalElementsExpected) {
        console.error(`Error: Mismatch in element count. Expected ${totalElementsExpected} values, but found ${rawNumericStrings.length}.`);
        return;
    }

    // Convert each string in the array to a numeric type.
    // The Number constructor is used for explicit type conversion.
    const numericValues = rawNumericStrings.map(Number);

    // Check if any of the converted values resulted in NaN (Not-a-Number), indicating invalid numeric input.
    if (numericValues.some(isNaN)) {
        console.error("Error: One or more input values are not valid numbers.");
        return;
    }

    // --- Core Iterative Calculation Logic ---

    // Initialize the primary accumulator variable.
    // This variable holds the evolving result of the iterative calculation,
    // analogous to the 'numerator' in the original code.
    let currentAccumulatedValue = 1;

    // The first element from the input list serves as a fixed divisor throughout the loop.
    // Declared as 'const' to emphasize it does not change.
    const fixedBaseDivisor = numericValues[0];

    // Critical guard clause: Ensure the fixed base divisor is not zero,
    // as it's used in division and LCM calculations.
    if (fixedBaseDivisor === 0) {
        console.error("Error: The initial base divisor (first input value) cannot be zero.");
        return;
    }

    // Iterate through the numeric values, starting from the second element (index 1).
    // The loop processes 'totalElementsExpected - 1' elements to update the accumulator.
    for (let elementIndex = 1; elementIndex < totalElementsExpected; ++elementIndex) {
        const currentElementForProcessing = numericValues[elementIndex];

        // Another critical guard clause: Ensure no subsequent element is zero,
        // as they are also used in LCM and division.
        if (currentElementForProcessing === 0) {
            console.error(`Error: Encountered a zero value at index ${elementIndex}. Cannot proceed with calculations.`);
            return;
        }

        // Calculate the Least Common Multiple (LCM) of the fixed base divisor
        // and the current element from the array.
        const calculatedLeastCommonMultiple = determineLeastCommonMultiple(fixedBaseDivisor, currentElementForProcessing);

        // Compute two intermediate scaling factors.
        // These factors are derived from the LCM and the divisors involved in the current step.
        const scalingFactorForAccumulator = calculatedLeastCommonMultiple / fixedBaseDivisor;
        const scalingFactorForCurrentElement = calculatedLeastCommonMultiple / currentElementForProcessing;

        // Update the accumulated value using the specific formula:
        // currentAccumulatedValue = (previous_accumulator * scalingFactorForAccumulator) + scalingFactorForCurrentElement;
        // This complex update structure is central to the original algorithm's logic.
        currentAccumulatedValue = currentAccumulatedValue * scalingFactorForAccumulator + scalingFactorForCurrentElement;
    }

    // --- Final Result Output ---

    // Final guard clause: Prevent division by zero if the accumulated value somehow becomes zero.
    if (currentAccumulatedValue === 0) {
        console.error("Error: The final accumulated value is zero, preventing division by zero for the final result.");
        return;
    }

    // Output the final calculated result to the console.
    // The result is the fixed base divisor divided by the final accumulated value.
    console.log(fixedBaseDivisor / currentAccumulatedValue);
};

// This section is standard boilerplate for competitive programming in Node.js.
// It reads all input from standard input and passes it to the main processing function.
// As per instructions, this part should remain unchanged.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));