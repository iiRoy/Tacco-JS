function ProcessInputNumbers(rawInputString) {
    // Validate and parse the input string to obtain the desired count of numbers.
    // The trim() method is added for robustness against leading/trailing whitespace.
    const targetCount = Number.parseInt(rawInputString.trim(), 10);

    // Implement a guard clause to ensure targetCount is a valid positive integer.
    if (isNaN(targetCount) || targetCount <= 0) {
        console.error("Error: The provided input for target count is invalid or non-positive. Please supply a positive integer.");
        return; // Exit the function early if validation fails.
    }

    // This dynamic array will accumulate the sequence of "Harshad-like" numbers.
    const collectedHarshadNumbers = [];

    // Initialize parameters for generating candidate numbers.
    // 'currentLeftCandidate' stores the last number successfully added to our collection.
    // 'currentRightMultiplier' is used to increment the sequence in a structured way.
    let currentLeftCandidate = 0;
    let currentRightMultiplier = 1;

    // Continuously generate and evaluate numbers until the target count is reached.
    while (collectedHarshadNumbers.length < targetCount) {
        // Formulate the next prospective number in the sequence.
        const prospectiveNumber = currentLeftCandidate + currentRightMultiplier;

        // Pre-calculate the sum of digits for the current prospective number
        // and the next potential number in the sequence to avoid redundant computations.
        const sumDigitsOfProspective = calculateDigitSum(prospectiveNumber);
        const sumDigitsOfNextPotential = calculateDigitSum(prospectiveNumber + currentRightMultiplier);

        // Add a defensive check against division by zero.
        // Although digit sum for positive integers is always positive, this adds robustness.
        if (sumDigitsOfProspective === 0 || sumDigitsOfNextPotential === 0) {
            // If a digit sum is unexpectedly zero, skip this iteration and try a larger multiplier.
            currentRightMultiplier *= 10;
            continue;
        }

        // Calculate the "Harshad-like" ratios for comparison.
        // This logic determines whether the 'prospectiveNumber' fits the desired sequence criteria.
        const ratioForProspective = prospectiveNumber / sumDigitsOfProspective;
        const ratioForNextPotential = (prospectiveNumber + currentRightMultiplier) / sumDigitsOfNextPotential;

        // Compare the ratios to decide whether to add the current prospective number
        // or to adjust the multiplier for the next iteration.
        if (ratioForProspective <= ratioForNextPotential) {
            // If the condition holds, the prospective number is added to the collection.
            collectedHarshadNumbers.push(prospectiveNumber);
            // Update the 'left' candidate to the newly added number, advancing the sequence base.
            currentLeftCandidate = prospectiveNumber;
        } else {
            // If the condition does not hold, we need to explore numbers of a higher magnitude.
            // This is achieved by multiplying the 'right' multiplier by 10.
            currentRightMultiplier *= 10;
        }
    }

    // After collecting the required numbers, print each one on a new line.
    console.log(collectedHarshadNumbers.join("\n"));
}

// Function to calculate the sum of digits of a given number.
// This version is iterative, providing an alternative implementation to recursion.
function calculateDigitSum(inputNumber) {
    // Ensure the input is treated as a non-negative integer for digit summation.
    let numberToProcess = Math.abs(Math.floor(inputNumber));
    let totalDigitSum = 0;

    // Handle the special case where the input number is 0.
    if (numberToProcess === 0) {
        return 0;
    }

    // Loop through the digits, adding each to the sum.
    while (numberToProcess > 0) {
        totalDigitSum += numberToProcess % 10; // Get the last digit.
        numberToProcess = Math.floor(numberToProcess / 10); // Remove the last digit.
    }
    return totalDigitSum;
}

// --- Execution Entry Point ---
// Set up the file system module and input path.
const fileSystem = require("fs");
const standardInputPath = "/dev/stdin";

// Use a try-catch block for robust file reading, handling potential errors.
try {
    // Read the entire content of the standard input file as a UTF-8 string.
    const rawInputData = fileSystem.readFileSync(standardInputPath, "utf8");
    // Invoke the primary processing function with the obtained input.
    ProcessInputNumbers(rawInputData);
} catch (readError) {
    // Log any errors encountered during file reading.
    console.error(`An error occurred while attempting to read from ${standardInputPath}:`, readError.message);
    // Depending on requirements, one might choose to exit the process or use a default input here.
}