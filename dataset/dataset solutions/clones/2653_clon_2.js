function processInput(rawData) {
    // Split the incoming data string by a space character.
    const parts = rawData.split(' ');

    // Assign the first part to a variable representing the first operand string.
    const firstOperandStr = parts[0];

    // Assign the second part to a variable representing the second operand string.
    const secondOperandStr = parts[1];

    // Calculate the sum. For strings, the '+' operator performs concatenation.
    const sumResult = firstOperandStr + secondOperandStr;

    // Calculate the difference. The '-' operator forces string operands to be converted to numbers.
    const diffResult = firstOperandStr - secondOperandStr;

    // Calculate the product. The '*' operator also forces string operands to be converted to numbers.
    const prodResult = firstOperandStr * secondOperandStr;

    // Evaluate which of the three calculated values is the greatest.
    // Note: Comparisons involving 'sumResult' (a string) and numbers will use type coercion.
    if (sumResult > diffResult && sumResult > prodResult) {
        // If the concatenated string is the largest, print it.
        console.log(sumResult);
    } else if (diffResult > sumResult && diffResult > prodResult) {
        // If the numerical difference is the largest, print it.
        console.log(diffResult);
    } else {
        // Otherwise, the numerical product is the largest (or tied for largest), so print it.
        console.log(prodResult);
    }
}

// Read the entire content of standard input as a UTF-8 string and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
