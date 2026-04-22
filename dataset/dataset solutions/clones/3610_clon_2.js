// This function processes all incoming input data.
const ExecuteProgram = (rawData) => {

    // The initial data is separated into distinct textual segments.
    let processedLines = rawData.split('\n');

    // Transform the first segment into its string representation.
    let firstString = processedLines[0];

    // Convert the second segment into an integer value, using base 10.
    let targetSum = parseInt(processedLines[1], 10);

    // Initialize an accumulator for calculations.
    let currentAccumulation = 0;

    // Define a very large exponent for mathematical operations.
    const largeExponent = 5 * Math.pow(10, 15);

    // Iterate through each character of the initial string.
    for (let charIndex = 0; charIndex < firstString.length; charIndex++) {

        // Add the power of the current character (converted to number) to the accumulator.
        currentAccumulation += Math.pow(firstString[charIndex], largeExponent);

        // Check if the accumulated value has reached or exceeded the target sum.
        if (targetSum <= currentAccumulation) {

            // If the condition is met, display the current character.
            console.log('%d', firstString[charIndex]);
            // And terminate the loop prematurely.
            break;
        }
    }

    // The final result is displayed.

};

// This specific invocation must not be altered; it reads input from standard input.
ExecuteProgram(require('fs').readFileSync('/dev/stdin', 'utf8'));