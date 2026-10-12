function ProcessInput(rawData) {
    // Trim any leading or trailing whitespace from the input string.
    rawData = rawData.trim();

    // The following lines are commented out as they represent alternative input parsing strategies
    // not utilized in this particular problem's solution.
    // rawData = rawData.split("\n");
    // rawData = rawData.map(element => element.split(" ").map(subElement => parseInt(subElement)));

    // Convert the processed input string into an integer, which serves as our primary target value.
    let targetValue = parseInt(rawData);

    // Initialize two variables that will hold the computed results.
    let valA = 0; // This variable will store the integer 'A' value.
    let valB = 0; // This variable will store the integer 'B' value that satisfies the condition.

    // Begin an iterative search for the 'B' value.
    // The loop iterates through a wide range of integers for 'iterVar' (our 'B').
    for (let iterVar = -100; iterVar < 100000000; iterVar++) {
        // Calculate 'valA' using the mathematical formula: A = (X + B^5)^(1/5).
        // Math.pow(base, exponent) is used for exponentiation.
        valA = Math.pow(targetValue + Math.pow(iterVar, 5), 1 / 5);

        // Check if the calculated 'valA' is an integer.
        // An integer will have no fractional part, so A - floor(A) will be exactly 0.
        if (valA - Math.floor(valA) === 0) {
            valB = iterVar; // If 'valA' is an integer, we've found our 'B'.
            break; // Exit the loop immediately as the solution has been found.
        }
    }

    // Output the final integer values of 'A' and 'B' to the console, separated by a space.
    console.log(valA + " " + valB);
}

// Read the entire content of the standard input stream as a UTF-8 string
// and then pass it to our main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
