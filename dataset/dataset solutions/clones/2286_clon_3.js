const findGreatestCommonDivisor = (firstNum, secondNum) => {
    // Ensure inputs are positive integers for GCD calculation.
    // The Euclidean algorithm inherently works with non-negative numbers.
    const absoluteFirst = Math.abs(firstNum);
    const absoluteSecond = Math.abs(secondNum);

    // Base case: if the second number is zero, the GCD is the first number.
    if (absoluteSecond === 0) {
        return absoluteFirst;
    }
    // Recursive step: GCD(a, b) = GCD(b, a % b)
    return findGreatestCommonDivisor(absoluteSecond, absoluteFirst % absoluteSecond);
};

const calculatePairwiseLcm = (val1, val2) => {
    // Handle cases where one or both numbers are zero.
    // The LCM involving zero is typically considered zero.
    if (val1 === 0 || val2 === 0) {
        return 0;
    }
    // The formula for LCM of two numbers (a, b) is |a*b| / GCD(a, b).
    // Using Math.abs for the product ensures correctness even with negative inputs,
    // though problem contexts usually imply positive integers.
    const productOfValues = val1 * val2;
    const commonDivisor = findGreatestCommonDivisor(val1, val2);
    return Math.abs(productOfValues) / commonDivisor;
};

function calculateLeastCommonMultiple(valueArray) {
    // Input validation: Check if the provided input is a valid array and not empty.
    if (!Array.isArray(valueArray) || valueArray.length === 0) {
        console.warn("Warning: Input array for LCM computation is either empty or not an array. Returning 0.");
        return 0; // A reasonable default for invalid input.
    }

    // Filter out any non-numeric or non-positive values, as LCM is typically
    // defined for positive integers. This adds robustness to the function.
    const positiveIntegers = valueArray.filter(num => typeof num === 'number' && num > 0);

    // If no positive integers remain after filtering, LCM cannot be computed meaningfully.
    if (positiveIntegers.length === 0) {
        console.warn("Warning: No positive numbers found in the input sequence for LCM calculation. Returning 0.");
        return 0;
    }

    // Initialize the accumulated LCM with the first valid positive integer.
    let currentAccumulatedLcm = positiveIntegers[0];

    // Iterate through the rest of the positive integers to progressively calculate the LCM.
    // The LCM of a set of numbers is found by taking the LCM of the current result
    // and the next number in the sequence.
    for (let currentIdx = 1; currentIdx < positiveIntegers.length; currentIdx++) {
        const nextNumberInSequence = positiveIntegers[currentIdx];
        currentAccumulatedLcm = calculatePairwiseLcm(currentAccumulatedLcm, nextNumberInSequence);
    }

    return currentAccumulatedLcm;
}

function processInput(rawDataContent) {
    // Ensure input is an array and has expected number of lines.
    if (!Array.isArray(rawDataContent) || rawDataContent.length < 2) {
        console.error("Error: Insufficient input data. Expected at least two lines.");
        return;
    }

    // Parse the first line which contains configuration parameters.
    const configurationElements = rawDataContent[0].split(" ");
    if (configurationElements.length < 2) {
        console.error("Error: First line of input is malformed. Expected at least two numbers.");
        return;
    }

    // The first value (N) specifies the count of elements, but it's not directly
    // used in the final calculation for this problem's specific logic.
    // We parse it for completeness but then don't use it further.
    const specifiedElementCount = parseInt(configurationElements[0], 10);
    // The second value (M) is the upper bound for the calculation.
    const maximumBoundValue = Number(configurationElements[1]);

    // Validate the parsed upper bound.
    if (isNaN(maximumBoundValue) || maximumBoundValue < 0) {
        console.error("Error: Invalid or negative upper bound value detected. Please provide a positive number.");
        return;
    }

    // Parse the second line, which contains the sequence of numbers for LCM computation.
    // Each string element is converted to an integer.
    const numericalSequence = rawDataContent[1].split(" ").map(strVal => parseInt(strVal, 10));

    // Basic validation for the numerical sequence.
    if (numericalSequence.length === 0) {
        console.error("Error: The input sequence of numbers for LCM calculation is empty.");
        return;
    }
    // Optional check: Compare parsed N with actual array length.
    // if (specifiedElementCount !== numericalSequence.length) {
    //     console.warn(`Warning: Declared element count (${specifiedElementCount}) does not match actual sequence length (${numericalSequence.length}). Proceeding with actual length.`);
    // }

    // Compute the Least Common Multiple for the extracted sequence of numbers.
    const finalComputedLcm = calculateLeastCommonMultiple(numericalSequence);

    // If LCM calculation resulted in 0 (due to empty array, non-positive numbers, etc.),
    // it indicates an uncomputable scenario for the subsequent steps.
    if (finalComputedLcm === 0) {
        console.error("Error: LCM calculation failed or resulted in zero, cannot proceed with final computation.");
        return;
    }

    // Perform the main arithmetic operation based on the problem's logic:
    // Math.trunc(M / (lcm / 2)) - Math.trunc(M / lcm)
    // We introduce intermediate variables for clarity and to demonstrate structural changes.
    const halfOfTheLcm = finalComputedLcm / 2;

    const firstDivisionResult = maximumBoundValue / halfOfTheLcm;
    const secondDivisionResult = maximumBoundValue / finalComputedLcm;

    // Apply the floor (truncation) operation to both division results.
    const firstFlooredValue = Math.trunc(firstDivisionResult);
    const secondFlooredValue = Math.trunc(secondDivisionResult);

    // Calculate the final difference and output it.
    const ultimateCalculatedDifference = firstFlooredValue - secondFlooredValue;
    console.log(ultimateCalculatedDifference);
}

// Entry point for execution, reading input from standard in.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));