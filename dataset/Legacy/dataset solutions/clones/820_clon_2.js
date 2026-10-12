let mainLoopCount = Math.floor(readline()); // Obtain the total number of iterations from input.

/**
 * Computes 10 raised to the power of the given exponent,
 * ensuring the exponent is an integer.
 * @param {number} exponentValue - The value to be used as the exponent.
 * @returns {number} 10 raised to the power of the floored exponent.
 */
const calculatePowerOfTen = (exponentValue) => {
    return Math.pow(10, Math.floor(exponentValue));
};

// Iterate through each test case.
for (let currentIteration = 0; currentIteration < mainLoopCount; ++currentIteration) {
    let resultCollection = []; // Initialize an array to store valid pairs for the current case.
    let inputParts = readline().split(' '); // Read a line of input and split it into parts.

    // Determine the lower and upper bounds for the first number.
    // The range is [10^(o[0]-1), 10^o[0] - 1]
    const lowerBoundA = calculatePowerOfTen(inputParts[0] - 1);
    const upperBoundA = calculatePowerOfTen(inputParts[0]);

    // Determine the lower and upper bounds for the second number.
    // The range is [10^(o[1]-1), 10^o[1] - 1]
    const lowerBoundB = calculatePowerOfTen(inputParts[1] - 1);
    const upperBoundB = calculatePowerOfTen(inputParts[1]);

    // Iterate through possible values for the first number.
    for (let firstNumber = lowerBoundA; firstNumber < upperBoundA; ++firstNumber) {
        // Iterate through possible values for the second number.
        for (let secondNumber = lowerBoundB; secondNumber < upperBoundB; ++secondNumber) {
            // Calculate the arithmetic sum based on the formula (a+b)*(b-a+1)/2.
            const arithmeticSum = (firstNumber + secondNumber) * (secondNumber - firstNumber + 1) / 2;
            // Concatenate the numbers as strings to form a new string.
            const concatenatedString = '' + firstNumber + secondNumber;

            // Check if the arithmetic sum equals the numerical value of the concatenated string.
            if (arithmeticSum === Number(concatenatedString)) {
                // If they match, add the pair to the collection.
                resultCollection.push(firstNumber + ' ' + secondNumber);
            }
        }
    }

    // Output the results for the current test case.
    if (resultCollection.length > 0) {
        // If there are results, print each one on a new line.
        resultCollection.map((resultString) => print(resultString));
    } else {
        // If no results were found, print the specific message.
        print('No cats.');
    }
}
