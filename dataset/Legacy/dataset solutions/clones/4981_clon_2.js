// This function serves as the primary entry point for processing the input data.
function ProcessInput(rawData) {
    // A constant variable to hold the input string, making it accessible throughout the function.
    const expressionString = rawData;

    // A recursive helper function designed to compute all possible sums by inserting '+' signs.
    // currentExpression: Represents the string built so far, including digits and potential '+' signs.
    // currentIndex: Indicates the current position being examined within the original expressionString.
    const calculateCombinations = (currentExpression, currentIndex) => {
        // This is the base condition for the recursion. If we've processed all characters
        // up to the last one in the original string, it's time to evaluate the formed expression.
        if (currentIndex === expressionString.length - 1) {
            // The expression string is split by '+', each resulting part is converted to a number,
            // and then all these numbers are summed up to get the final value for this specific combination.
            return currentExpression
                .split("+")
                .map(Number)
                .reduce((accumulator, currentValue) => Number(accumulator) + Number(currentValue));
        }

        // In the recursive step, we explore two distinct paths for the next character:
        // Path 1: Append the next digit directly to the current expression without any '+' sign.
        const sumWithoutPlus = calculateCombinations(currentExpression + expressionString[currentIndex + 1], currentIndex + 1);

        // Path 2: Append a '+' sign before appending the next digit to the current expression.
        const sumWithPlus = calculateCombinations(currentExpression + "+" + expressionString[currentIndex + 1], currentIndex + 1);

        // The total result for the current branch is the sum of the results from both explored paths.
        return sumWithoutPlus + sumWithPlus;
    };

    // The initial call to the recursive function starts with the first character of the input string
    // as the beginning of the current expression and an initial index of 0.
    console.log(calculateCombinations(expressionString[0], 0));

    // The function completes its execution after logging the result.
    return;
}

// The program begins by reading the input from standard input,
// decoding it as UTF-8, and then passing it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
