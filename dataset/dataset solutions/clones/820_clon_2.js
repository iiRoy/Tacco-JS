let numberOfTestCases = parseInt(readLine(), 10); // Acquire the total count of processing cycles required.

/*
 *  This helper function computes 10 raised to a specified power.
 *  It ensures the exponent is an integer by flooring it.
 *  @param {number} exponentValue - The numerical exponent to be applied.
 *  @returns {number} The result of 10 to the power of the floored exponent.
 */
const powerGenerator = (exponentValue) => {
    return Math.pow(10, Math.floor(exponentValue));
};

// Commence the primary processing loop, iterating for each defined test case.
for (let testCaseIndex = 0; testCaseIndex < numberOfTestCases; ++testCaseIndex)
{
    // Initialize a dynamic array to store all valid numerical pairs discovered during this iteration.
    let matchingPairs = [];

    // Read a single line of input and dissect it into individual string tokens, separated by spaces.
    let inputDimensions = readLine().split(' ');

    // Begin a nested loop to identify the first number in potential pairs.
    // The range is determined by the first input dimension.
    for (
        let firstNumber = powerGenerator(parseInt(inputDimensions[0], 10) - 1);
        firstNumber < powerGenerator(parseInt(inputDimensions[0], 10));
        ++firstNumber
    ) {
        // Initiate the inner loop to find the second number in potential pairs.
        // Its range is derived from the second input dimension.
        for (
            let secondNumber = powerGenerator(parseInt(inputDimensions[1], 10) - 1);
            secondNumber < powerGenerator(parseInt(inputDimensions[1], 10));
            ++secondNumber
        ) {
            // Compute the sum of an arithmetic sequence starting from 'firstNumber' and ending at 'secondNumber'.
            // The formula applies (number_of_terms / 2) * (first_term + last_term).
            // Here, number_of_terms = (secondNumber - firstNumber + 1).
            const arithmeticProgressionSum = (firstNumber + secondNumber) * (secondNumber - firstNumber + 1) / 2;

            // Concatenate the two numbers into a single string.
            const combinedString = String(firstNumber) + String(secondNumber);

            // Evaluate if the calculated arithmetic sum is numerically equivalent to the integer value of the combined string.
            if (arithmeticProgressionSum === parseInt(combinedString, 10)) {
                // If the condition is satisfied, store the pair as a space-separated string in the results array.
                matchingPairs.push(firstNumber + ' ' + secondNumber);
            }
        }
    }

    // After exhausting all potential number combinations for the current test case,
    // proceed to display the accumulated results.
    if (matchingPairs.length > 0) {
        // If one or more matching pairs were found, iterate through them and output each one.
        matchingPairs.forEach(currentResultString => outputResult(currentResultString));
    } else {
        // Should no matching pairs be identified, output a specific message indicating this absence.
        outputResult('No matching pairs found.');
    }
}