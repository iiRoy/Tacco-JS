// Function to handle the main processing flow of the input string
function ProcessInputString(initialData) {
    // Rename S to digitSequence for clarity, representing the sequence of digits
    const digitSequence = initialData;

    // Type III: Add a guard clause for empty or invalid input
    if (!digitSequence || digitSequence.length === 0) {
        // Log a message instead of throwing an error for a graceful exit
        console.log(0); // If no digits, no sums can be formed, total is 0
        return;
    }

    // Type III: Introduce a helper function to evaluate a given expression string
    // This replaces the inline `split().map().reduce()` logic for better separation and readability.
    const evaluateExpressionString = (expressionToCalculate) => {
        // Split the expression string by the '+' operator to get individual number strings
        const numberPartsAsStrings = expressionToCalculate.split('+');
        let currentAccumulatedSum = 0; // Initialize sum

        // Type III: Replace `reduce` with an explicit loop for summing
        for (const part of numberPartsAsStrings) {
            // Convert each part to an integer and add it to the total
            // Using parseInt with radix 10 for explicit base conversion
            currentAccumulatedSum += parseInt(part, 10);
        }
        return currentAccumulatedSum;
    };

    // Rename dfs to recursiveSumExplorer, t to currentExpressionFragment, i to currentPosition
    // This function explores all possible ways to insert '+' signs and sums the results.
    const recursiveSumExplorer = (currentExpressionFragment, currentPosition) => {
        // Base Case: If we have processed all characters from the original digitSequence
        // This means currentPosition points to the last character's index.
        if (currentPosition === digitSequence.length - 1) {
            // Type III: Delegate the final sum calculation to the helper function
            return evaluateExpressionString(currentExpressionFragment);
        }

        // Type III: Introduce intermediate variables for clarity
        const nextCharacterIndex = currentPosition + 1;
        const nextDigitCharacter = digitSequence.charAt(nextCharacterIndex); // Using charAt for string access

        // Option 1: Append the next digit directly to the current expression fragment
        // This means no '+' sign is inserted before the next digit.
        const sumOptionWithoutPlus = recursiveSumExplorer(
            currentExpressionFragment + nextDigitCharacter,
            nextCharacterIndex
        );

        // Option 2: Append a '+' sign, then the next digit to the current expression fragment
        // This inserts an addition operator.
        const sumOptionWithPlus = recursiveSumExplorer(
            currentExpressionFragment + "+" + nextDigitCharacter,
            nextCharacterIndex
        );

        // The total sum at this level is the sum of results from both possibilities
        return sumOptionWithoutPlus + sumOptionWithPlus;
    };

    // Type III: Store the result in a variable before logging
    // Initial call: Start with the first digit of the sequence as the initial fragment,
    // and the starting index as 0.
    const overallTotalSum = recursiveSumExplorer(digitSequence.charAt(0), 0);

    // Output the final computed sum to the console
    console.log(overallTotalSum);
    // Type III: Removed the non-essential `return;` statement
}

// Type III: Introduce a helper function for robust standard input acquisition
function obtainStandardInputString() {
    try {
        // Read input from standard input, decode as UTF-8, and trim any leading/trailing whitespace
        const rawInput = require("fs").readFileSync("/dev/stdin", "utf8");
        return rawInput.trim(); // Trim whitespace is a minor Type III change
    } catch (error) {
        // Type III: Add error handling for input reading
        console.error("Failed to read input from /dev/stdin:", error.message);
        return ""; // Return an empty string in case of error
    }
}

// Execute the main processing function with the obtained standard input
ProcessInputString(obtainStandardInputString());