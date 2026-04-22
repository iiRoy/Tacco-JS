function isNumericDigit(char) {
    return char >= '0' && char <= '9';
}

function calculateSumExpression(rawDigitString) {
    // Input validation: Ensure the input is a string of sufficient length
    if (typeof rawDigitString !== 'string' || rawDigitString.length < 4) {
        console.error("Error: Input must be a string containing at least four digits.");
        return "Invalid input provided.";
    }

    // Extract individual character digits
    const digitOneChar = rawDigitString.charAt(0);
    const digitTwoChar = rawDigitString.charAt(1);
    const digitThreeChar = rawDigitString.charAt(2);
    const digitFourChar = rawDigitString.charAt(3);

    // Validate if extracted characters are indeed digits
    if (!isNumericDigit(digitOneChar) || !isNumericDigit(digitTwoChar) ||
        !isNumericDigit(digitThreeChar) || !isNumericDigit(digitFourChar)) {
        console.error("Error: Non-digit characters found in the first four positions of the input.");
        return "Input contains non-digit characters.";
    }

    // Convert character digits to integer numbers using parseInt with radix
    const digitOne = parseInt(digitOneChar, 10);
    const digitTwo = parseInt(digitTwoChar, 10);
    const digitThree = parseInt(digitThreeChar, 10);
    const digitFour = parseInt(digitFourChar, 10);

    // Define the constant target sum
    const requiredSum = 7;

    // Iterate through all 8 possible combinations of binary operators
    // The 'operatorBitmask' variable encodes the choices for three operators
    for (let operatorBitmask = 0; operatorBitmask < 8; operatorBitmask++) {
        // Determine the sign and symbol for the first operator (between digitOne and digitTwo)
        // Bit 0 of the bitmask determines this operator
        const isFirstOpSubtraction = (operatorBitmask & 1) === 1;
        const firstOperatorSymbol = isFirstOpSubtraction ? '-' : '+';
        const firstOperatorMultiplier = isFirstOpSubtraction ? -1 : 1;

        // Determine the sign and symbol for the second operator (between digitTwo and digitThree)
        // Bit 1 of the bitmask determines this operator
        const isSecondOpSubtraction = (operatorBitmask & 2) === 2;
        const secondOperatorSymbol = isSecondOpSubtraction ? '-' : '+';
        const secondOperatorMultiplier = isSecondOpSubtraction ? -1 : 1;

        // Determine the sign and symbol for the third operator (between digitThree and digitFour)
        // Bit 2 of the bitmask determines this operator
        const isThirdOpSubtraction = (operatorBitmask & 4) === 4;
        const thirdOperatorSymbol = isThirdOpSubtraction ? '-' : '+';
        const thirdOperatorMultiplier = isThirdOpSubtraction ? -1 : 1;

        // Calculate the current expression's value using the determined signs
        let currentExpressionValue = digitOne;
        currentExpressionValue += (firstOperatorMultiplier * digitTwo);
        currentExpressionValue += (secondOperatorMultiplier * digitThree);
        currentExpressionValue += (thirdOperatorMultiplier * digitFour);

        // Check if the calculated value matches the target sum
        if (currentExpressionValue === requiredSum) {
            // If a match is found, construct the result string using template literals
            return `${digitOne}${firstOperatorSymbol}${digitTwo}${secondOperatorSymbol}${digitThree}${thirdOperatorSymbol}${digitFour}=${requiredSum}`;
        }
    }

    // Fallback: This statement should ideally not be reached if a solution always exists for valid inputs.
    return "No valid arithmetic combination found for the target sum.";
}

// Orchestrates the input reading and solution execution process
function processInputAndOutput() {
    // Reference the Node.js file system module
    const fileSystemModule = require("fs");

    let rawInputBuffer;
    try {
        // Read input data from standard input, ensuring UTF-8 encoding
        rawInputBuffer = fileSystemModule.readFileSync("/dev/stdin", "utf8");
    } catch (ioError) {
        console.error(`Failed to read input from /dev/stdin: ${ioError.message}`);
        return "Error during input reading.";
    }

    // Trim any leading/trailing whitespace from the input string
    const cleanedInputString = rawInputBuffer.trim();

    // Invoke the core logic to find the expression
    const finalResultExpression = calculateSumExpression(cleanedInputString);

    return finalResultExpression;
}

// Execute the main process and print the returned result to standard output
console.log(processInputAndOutput());