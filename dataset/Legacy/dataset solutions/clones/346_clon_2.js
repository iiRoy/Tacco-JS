(function (inputData) {
    // This function evaluates expressions involving addition and subtraction.
    function calculateSumDiff() {
        // Start by getting the value of a term (multiplication/division).
        let resultVal = processProductQuotient();

        // Continuously process addition and subtraction operations.
        for (;;) {
            // Check if the current character is a plus sign.
            if (expressionString[charPointer] === "+") {
                charPointer++; // Advance past the '+' symbol.
                resultVal += processProductQuotient(); // Add the next term's value.
            }
            // Check if the current character is a minus sign.
            else if (expressionString[charPointer] === "-") {
                charPointer++; // Advance past the '-' symbol.
                resultVal -= processProductQuotient(); // Subtract the next term's value.
            }
            // If neither '+' nor '-' is found, stop processing sums/differences.
            else {
                break;
            }
        }
        return resultVal; // Return the final computed value.
    }

    // This function evaluates terms involving multiplication and division.
    function processProductQuotient() {
        // Begin by getting a value that might be inside parentheses or a direct number.
        let currentProduct = handleParenthesesOrNumber();

        // Loop to handle subsequent multiplication and division operations.
        while (true) {
            // If the current character is a multiplication sign.
            if (expressionString[charPointer] === "*") {
                charPointer++; // Move past the '*' symbol.
                // Multiply the current product by the next bracketed/numeric value, then floor the result.
                currentProduct = Math.floor(currentProduct * handleParenthesesOrNumber());
            }
            // If the current character is a division sign.
            else if (expressionString[charPointer] === "/") {
                charPointer++; // Move past the '/' symbol.
                // Divide the current product by the next bracketed/numeric value, then floor the result.
                currentProduct = Math.floor(currentProduct / handleParenthesesOrNumber());
            }
            // If no '*' or '/' is found, terminate the loop.
            else {
                break;
            }
        }

        return currentProduct; // Return the calculated product/quotient.
    }

    // This function handles parentheses or delegates to number parsing.
    function handleParenthesesOrNumber() {
        let parsedValue; // Variable to store the value obtained.

        // Check if the current character indicates an opening parenthesis.
        if (expressionString[charPointer] === "(") {
            charPointer++;   // Skip over the opening parenthesis.
            parsedValue = calculateSumDiff(); // Recursively evaluate the expression inside.
            charPointer++;   // Skip over the closing parenthesis.
        } else {
            // If no parenthesis, it must be a direct number.
            return parseNumericValue();
        }

        return parsedValue; // Return the value from inside parentheses.
    }

    // This function parses a sequence of digits into an integer.
    function parseNumericValue() {
        let numericResult = 0x0; // Initialize the result to zero.

        // Continue as long as the current character is a digit.
        while (expressionString[charPointer] && expressionString[charPointer].match(/[0-9]/)) {
            numericResult *= 0xA; // Multiply the current result by ten (0xA in hex).
            numericResult += parseInt(expressionString[charPointer]); // Add the integer value of the current digit.
            charPointer++; // Advance to the next character.
        }

        return numericResult; // Return the fully parsed number.
    }

    // --- Main execution flow starts here ---

    // Process the raw input: remove carriage returns and split into lines.
    let inputLines = inputData.replace(/\r/g, '').split("\n");
    let charPointer; // Pointer for the current character in the expression string.
    let remainingExpressions; // Counter for the number of expressions to evaluate.

    // Get the total count of expressions from the first line of input.
    remainingExpressions = parseInt(inputLines.shift());

    // Loop through each expression provided in the input.
    while (remainingExpressions--) {
        // Get the next expression string and remove all whitespace.
        let expressionString = inputLines.shift().replace(/\s/g, "");
        charPointer = 0; // Reset the character pointer for the new expression.

        // Evaluate the expression and print the result to the console.
        console.log(calculateSumDiff());
    }
})(require("fs").readFileSync("/dev/stdin", "utf8"));
