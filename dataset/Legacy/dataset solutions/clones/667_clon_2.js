function processInputData() {
    // Declare various integer variables for loop counters and temporary storage.
    // Some of these might not be actively used in the current processing logic.
    let firstIndex, secondIndex, iterationCount, tempValA, tempValB, totalWeight, totalCount, runningSum;

    // Initiate an indefinite processing cycle.
    // This loop will continue to execute until an explicit break condition is met.
    for (iterationCount = 0; ; iterationCount++) {
        // Reset the cumulative sum for each new set of input data.
        runningSum = 0;

        // Read the initial input line, which determines the scope of the current data set.
        let initialInputString = readLine();
        // Convert the string input into its integer representation.
        let numericInput = parseInt(initialInputString);

        // Evaluate the termination condition: if the parsed numeric input is zero.
        if (numericInput === 0) {
            // Exit the primary data processing loop.
            break;
        }

        // Begin a nested loop to process subsequent input lines based on the numeric input.
        // The number of iterations is one-fourth of the initial numeric input.
        for (firstIndex = 0; firstIndex < numericInput / 4; firstIndex++) {
            // Read an additional line of input for the current sub-iteration.
            let subsequentInputString = readLine();
            // Convert this string input into an integer.
            let currentNumericValue = parseInt(subsequentInputString);
            // Accumulate the current numeric value into the running total.
            runningSum = runningSum + currentNumericValue;
        }
        // Display the final calculated sum for the completed data set.
        console.log(runningSum);
    }
}
