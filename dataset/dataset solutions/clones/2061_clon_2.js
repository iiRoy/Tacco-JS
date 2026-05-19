function ProcessInput(rawData) {
    // Split the raw input string into an array of lines
    // Each line represents either a size N or a sequence of digits
    rawData = rawData.split("\n");

    // Iterate through the input array, processing two lines at a time
    // The outer loop increments by 2 to get N and its corresponding digit sequence
    for (let outerIndex = 0; outerIndex < rawData.length; outerIndex += 2) {
        // Parse the first line of the pair as an integer, representing the initial size
        const currentSize = parseInt(rawData[outerIndex]);

        // Convert the second line of the pair into an array of individual characters (digits)
        const charArray = rawData[outerIndex + 1].split("");

        // Map the character array to an array of numbers
        // This creates the initial sequence for the difference calculation
        let numberSequence = charArray.map(Number);

        // This loop performs the core difference calculation
        // It iterates from the initial size down to 2
        for (let innerLoopCounter = currentSize; innerLoopCounter > 1; innerLoopCounter--) {
            // The inner loop processes elements within the current sequence
            // It runs 'innerLoopCounter' times for each step of the outer loop
            for (let iterationCount = 0; iterationCount < innerLoopCounter; iterationCount++) {
                // Calculate the absolute difference between the first two elements
                const differenceValue = Math.abs(numberSequence[0] - numberSequence[1]);

                // Add the calculated difference to the end of the sequence
                numberSequence.push(differenceValue);

                // Remove the first element from the sequence
                numberSequence.shift();
            }
            // After the inner loop completes, remove the last element
            // This effectively reduces the sequence length by one for the next iteration
            numberSequence.pop();
        }
        // Once all calculations are done, the sequence should contain only one element
        // Log this final element to the console
        console.log(numberSequence[0]);
    }
}

// Read input from standard input using Node.js file system module
// Then pass the content to the main processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
