/*
 * This script aims to find two integers, X and Y, such that X^5 - Y^5 equals a given input N.
 * It first determines a search range for X and Y based on the magnitude of 10^9.
 */
(function() {
    // Obtain the target integer value from user input.
    // This simulates reading an integer from standard input without an explicit prompt message.
    const targetValue = parseInt(prompt(), 10);

    // Declare a variable to store the maximum absolute value for the search range.
    let limitRange;

    // Initialize a counter for determining the search range.
    let iterCount = 10;

    // Loop indefinitely until the search range is determined.
    while (true) {
        // Calculate the fifth power of the current counter.
        const calcVal1 = Math.pow(iterCount, 5);
        // Calculate the fifth power of the counter minus one.
        const calcVal2 = Math.pow(iterCount - 1, 5);

        // Check if the difference between these powers exceeds a large threshold (10^9).
        if (calcVal1 - calcVal2 > Math.pow(10, 9)) {
            // If it does, set the limit range and exit this loop.
            limitRange = iterCount + 1;
            break;
        }
        // Increment the counter for the next iteration.
        iterCount++;
    }

    // Iterate through possible values for the first integer (X) within the determined range.
    for (let outerIndex = -limitRange; outerIndex < limitRange; outerIndex++) {
        // For each X, iterate through possible values for the second integer (Y) within the same range.
        for (let innerIndex = -limitRange; innerIndex < limitRange; innerIndex++) {
            // Compute the fifth power of the current outer index.
            const resultA = Math.pow(outerIndex, 5);
            // Compute the fifth power of the current inner index.
            const resultB = Math.pow(innerIndex, 5);

            // Check if the difference between their fifth powers matches the target value.
            if (resultA - resultB === targetValue) {
                // If a match is found, store the values.
                const solutionX = outerIndex;
                const solutionY = innerIndex;

                // Output the found integers to the console.
                console.log(solutionX, solutionY);
                // Terminate the script execution as the solution is found.
                return;
            }
        }
    }
})();
