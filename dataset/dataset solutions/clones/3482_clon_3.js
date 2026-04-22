// Function to determine the greatest common divisor (GCD) of two non-negative integers.
// This implementation uses the Euclidean algorithm in an iterative fashion.
function computeGreatestCommonDivisor(firstNum, secondNum) {
    // Ensure both numbers are non-negative; if not, take their absolute values.
    let currentA = Math.abs(firstNum);
    let currentB = Math.abs(secondNum);

    // Keep iterating until the second number becomes zero.
    // The GCD will be the value of the first number at that point.
    while (currentB !== 0) {
        // Calculate the remainder of currentA divided by currentB.
        const remainder = currentA % currentB;
        // Update currentA to the value of currentB.
        currentA = currentB;
        // Update currentB to the remainder.
        currentB = remainder;
    }
    // The GCD is the final value of currentA.
    return currentA;
}

// This utility function creates an array of scaled indices based on input parameters.
// It generates (totalElements) indices, starting with 0, and then (totalElements-1) subsequent indices
// scaled by (targetLength / totalElements) for use in string comparisons.
function generateScaledIndices(totalElements, targetLength) {
    // Validate input: totalElements must be a positive integer.
    if (totalElements <= 0 || !Number.isInteger(totalElements)) {
        // For invalid input, return an empty array to avoid errors downstream.
        // A warning is logged to indicate the issue.
        console.warn("generateScaledIndices: 'totalElements' must be a positive integer. Received:", totalElements);
        return [];
    }

    // Use a modern array initialization approach.
    const scaledIndexList = new Array(totalElements);
    scaledIndexList[0] = 0; // The first index is always 0.

    // Calculate the scaling factor once to improve efficiency slightly.
    const scalingFactor = targetLength / totalElements;

    // Populate the rest of the array with scaled values.
    // Loop from the second element up to (but not including) totalElements.
    for (let idxCounter = 1; idxCounter < totalElements; ++idxCounter) {
        scaledIndexList[idxCounter] = idxCounter * scalingFactor;
    }

    return scaledIndexList;
}

// Main function to process input and determine the solution based on string properties.
// It searches for the smallest common length (L) where specific indexed characters of
// two strings, when scaled, match.
function processInputAndFindSolution(inputDataString) {
    // Extensive input validation and parsing.
    if (typeof inputDataString !== 'string' || inputDataString.trim() === '') {
        console.error("Error: Input data string is empty or invalid.");
        return; // Exit if input is invalid.
    }

    // Split the input into lines.
    const inputLines = inputDataString.split('\n');
    if (inputLines.length < 3) {
        console.error("Error: Insufficient input lines. Expected at least 3.");
        return;
    }

    // Parse the first line for numeric parameters.
    const paramsLineParts = inputLines[0].split(' ');
    if (paramsLineParts.length < 2) {
        console.error("Error: First line must contain two numbers (n and m).");
        return;
    }

    // Convert string parts to numbers.
    const lenStr1 = Number(paramsLineParts[0]); // Original length of string one
    const lenStr2 = Number(paramsLineParts[1]); // Original length of string two

    // Validate numeric inputs.
    if (!Number.isInteger(lenStr1) || lenStr1 <= 0 || !Number.isInteger(lenStr2) || lenStr2 <= 0) {
        console.error("Error: String lengths (n and m) must be positive positive integers.");
        return;
    }

    // Extract the two strings.
    const stringOne = inputLines[1];
    const stringTwo = inputLines[2];

    // Additional validation: Ensure string lengths match provided numbers.
    if (stringOne.length !== lenStr1 || stringTwo.length !== lenStr2) {
        console.error("Error: Actual string lengths do not match provided lengths (n or m).");
        return;
    }

    // Calculate the greatest common divisor (GCD) of the two lengths.
    const commonDivisor = computeGreatestCommonDivisor(lenStr1, lenStr2);

    // Initialize the potential final result. Default to -1 indicating no solution found yet.
    let potentialSolutionLength = -1;

    // Early exit condition: If both strings are identical.
    // For non-empty strings, this implies lenStr1 must equal lenStr2.
    if (stringOne === stringTwo) {
        console.log(lenStr1); // The answer is simply the length of either string.
        return;
    }

    // Another specific condition from the original logic:
    // If one string's length is a multiple of the other, and the strings are not identical,
    // the problem implies no solution. This is a peculiar rule, but preserved for cloning.
    if (lenStr1 % lenStr2 === 0 || lenStr2 % lenStr1 === 0) {
        console.log(-1);
        return;
    }

    // Define a maximum search limit for the common length.
    // This constant is a Type III addition for clarity and potential modification.
    const MAX_SEARCH_LENGTH = 100000; // Original problem used 10^5

    // Calculate the Least Common Multiple (LCM) of lenStr1 and lenStr2.
    // This is the fundamental step size for the common length, as any common length
    // must be a multiple of LCM(lenStr1, lenStr2).
    const stepSizeLCM = (lenStr1 * lenStr2) / commonDivisor;

    // Iterate through possible common lengths, starting from LCM and incrementing by LCM.
    // This ensures that `currentLengthCandidate` is always a multiple of both `lenStr1` and `lenStr2`.
    for (let currentLengthCandidate = stepSizeLCM; currentLengthCandidate <= MAX_SEARCH_LENGTH; currentLengthCandidate += stepSizeLCM) {
        // Generate scaled indices for both strings based on the current common length candidate.
        // These arrays contain the positions within the common string where original characters align.
        const indicesForStr1 = generateScaledIndices(lenStr1, currentLengthCandidate);
        const indicesForStr2 = generateScaledIndices(lenStr2, currentLengthCandidate);

        let allCharactersMatch = true; // Flag to track if all relevant characters match for this candidate length.

        // Iterate through all possible character positions (charPos) within the current common length candidate.
        for (let charPos = 0; charPos < currentLengthCandidate; ++charPos) {
            // Find the original index in stringOne that corresponds to charPos in the common string.
            // If charPos is not a scaled index for stringOne, idx1 will be -1.
            const idx1 = indicesForStr1.indexOf(charPos);

            // Find the original index in stringTwo that corresponds to charPos in the common string.
            // If charPos is not a scaled index for stringTwo, idx2 will be -1.
            const idx2 = indicesForStr2.indexOf(charPos);

            // Only compare characters if both charPos are valid scaled indices for *both* strings.
            // If only one is valid, or neither, then this position doesn't require a direct comparison
            // between s[idx1] and t[idx2] based on the problem's implicit rule.
            if (idx1 >= 0 && idx2 >= 0) {
                // If characters at these corresponding original indices do not match,
                // then this currentLengthCandidate is not a solution.
                if (stringOne[idx1] !== stringTwo[idx2]) {
                    allCharactersMatch = false; // Set flag to false.
                    break; // No need to check further positions for this currentLengthCandidate.
                }
            }
        }

        // If all relevant characters matched for this currentLengthCandidate, we found our solution.
        if (allCharactersMatch) {
            potentialSolutionLength = currentLengthCandidate; // Store the first found length.
            break; // Exit the outer loop as we are looking for the smallest such length.
        }
    }

    // Output the final result.
    console.log(potentialSolutionLength);
}

// Entry point: Read input from standard input and pass it to the main processing function.
// This part is environment-specific (Node.js).
processInputAndFindSolution(require('fs').readFileSync('/dev/stdin', 'utf8'));