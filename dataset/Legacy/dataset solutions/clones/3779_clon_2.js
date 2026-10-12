function ProcessInput(rawData) {
    // Initialize a variable to store the main numerical value derived from the input.
    let targetValue = Number(rawData.trim());
    // A placeholder variable, 'resultHolder', is assigned the initial 'targetValue'.
    // In the original logic, this variable is not subsequently used or modified.
    let resultHolder = targetValue;
    
    // Begin an iterative process, starting from 'outerCounter' equal to 1.
    // The loop continues as long as 'outerCounter' is less than 'targetValue'.
    for (let outerCounter = 1; outerCounter < targetValue; outerCounter++) {
        // For each iteration, 'currentSum' is initialized with the value of 'outerCounter'.
        let currentSum = outerCounter;
        // Calculate the difference between 'targetValue' and 'currentSum', then convert it to a string.
        let sumStringRepresentation = String(targetValue - currentSum);
        
        // Iterate through each character (digit) of the 'sumStringRepresentation'.
        for (let innerIndex = 0; innerIndex < sumStringRepresentation.length; innerIndex++) {
            // Convert the current character back to a number and add it to 'currentSum'.
            currentSum += Number(sumStringRepresentation[innerIndex]);
        }
        
        // Evaluate the relationship between 'targetValue' and the newly calculated 'currentSum'.
        if (targetValue > currentSum) {
            // If 'targetValue' is greater, update 'targetValue' to this smaller 'currentSum'.
            targetValue = currentSum;
        } 
        // If 'targetValue' is not greater, check if it is strictly equal to 'currentSum'.
        else if (targetValue === currentSum) {
            // If they are equal, print 'currentSum' to the console.
            console.log(currentSum);
            // Terminate the function execution immediately as the desired condition is met.
            return;
        }
    }
}

// Read the entire content of standard input as a UTF-8 string.
// Then, pass this raw string data to the 'ProcessInput' function for processing.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
