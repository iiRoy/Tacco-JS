function processInputData(incomingData) {

    // Cleanse the received text by removing leading/trailing whitespace characters.
    let cleanedData = incomingData.trim();

    /*
     * The original problem statement indicates a single integer input.
     * We convert the cleaned string representation to its numeric equivalent.
     */
    const targetNum = parseInt(cleanedData);

    let calcValA = 0; // This variable will hold the computed 'A' value.
    let foundValB = 0; // This variable will store the 'B' value that satisfies the condition.

    // Iterate through a predefined range for the 'B' component.
    // The range spans from -100 to just under 100,000,000.
    for (let loopVarB = -100; loopVarB < 100000000; loopVarB++) {
        // Calculate 'A' using the formula: (targetNum + loopVarB^5)^(1/5).
        // This is equivalent to finding the fifth root of (targetNum + loopVarB^5).
        calcValA = Math.pow(targetNum + Math.pow(loopVarB, 5), 1 / 5);

        // Check if the calculated 'A' is an integer.
        // If 'A' minus its floor value is zero, it means 'A' has no fractional part.
        if (calcValA - Math.floor(calcValA) === 0) {
            // If an integer 'A' is found, then the current 'loopVarB' is our solution 'B'.
            foundValB = loopVarB;
            break; // Exit the loop immediately once the first valid pair is identified.
        }
    }

    // Output the resulting 'A' and 'B' values, separated by a space.
    console.log(calcValA + " " + foundValB);

}

// Execute the main data processing function.
// It reads input from the standard input stream, assuming UTF-8 encoding.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));