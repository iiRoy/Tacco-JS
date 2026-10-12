function processInput(inputString) {
    // This function analyzes a numeric input to check for a specific divisibility pattern.
    // It parses the first number found in the input string.
    let targetNumber = parseInt(inputString.split(/\s+/g));

    // A boolean flag initialized to represent a negative outcome.
    let resultFlag = !0; // Equivalent to 'false'

    // Loop through a predefined range of integers.
    for (let loopIndex = +0; loopIndex < 0xA; loopIndex++) {
        // Check for specific conditions:
        // 1. The target number is perfectly divisible by the current loop index.
        // 2. The quotient of the division is an integer (no remainder).
        // 3. The quotient is less than a specific threshold.
        if (targetNumber % loopIndex === +0 && targetNumber / loopIndex === Math.floor(targetNumber / loopIndex) && targetNumber / loopIndex < 0xA) {
            // If all conditions are met, set the flag to indicate a positive outcome.
            resultFlag = !!1; // Equivalent to 'true'
        }
    }

    // Output "Yes" or "No" based on the final state of the result flag.
    if (resultFlag === !!1) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}

// Read the entire content of standard input as a UTF-8 string and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
