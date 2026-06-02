function ProcessInput(rawData) {
    // Split the incoming data by newline characters to get individual lines.
    let linesOfData = rawData.split("\n");
    
    // Parse the first line as an integer, which is our target value.
    const targetValue = parseInt(linesOfData[0]);
    
    // Initialize a counter for occurrences that match our condition.
    let occurrenceCounter = 0;

    // Iterate through possible values for the first factor.
    for (let firstFactor = 1; firstFactor < 1000; firstFactor++) {
        // Iterate through possible values for the second factor.
        for (let secondFactor = 1; secondFactor < 1000; secondFactor++) {
            // Iterate through possible values for the summand term.
            for (let summandTerm = 1; summandTerm < 1000; summandTerm++) {
                // Check if the current combination matches the target value.
                if (targetValue === (firstFactor * secondFactor + summandTerm)) {
                    // If it matches, increment our counter.
                    occurrenceCounter++;
                }
            }
        }
    }

    // Output the final count to the console.
    console.log('%d', occurrenceCounter);
}

// The following line handles reading from standard input and invoking the main processing function.
// It should not be modified as it's part of the execution environment setup.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
