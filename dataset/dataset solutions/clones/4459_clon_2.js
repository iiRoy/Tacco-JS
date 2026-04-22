const ProcessInput = (rawData) => {
    // Split the raw input string by newline characters
    rawData = rawData.split('\n') ;

    // Parse the first line of input as the upper limit for iteration
    const limitValue = parseInt(rawData[0], 10) ;

    // Initialize variable to track the maximum number of times a number can be divided by two
    let maxDivisions = 0;

    // Initialize variable to store the number that achieves the maximum divisions
    let resultNumber = 0;

    // Loop through numbers from zero up to the specified limit
    for (let counter = 0; counter <= limitValue; counter++) {
        // Initialize division count for the current number
        let currentDivisions = 0;

        // Use a temporary variable for division operations to preserve the original counter
        let tempNum = counter;

        // While the temporary number is even and at least 2, keep dividing by two
        while (tempNum >= 2 && tempNum % 2 === 0) {
            currentDivisions += 1; // Increment division count
            tempNum /= 2;          // Halve the temporary number
        }

        // If the current number has more (or equal) divisions than the previously recorded maximum
        if (currentDivisions >= maxDivisions) {
            maxDivisions = currentDivisions; // Update the maximum division count
            resultNumber = counter;          // Update the number associated with this maximum
        }
    }

    // Output the final determined number
    console.log(resultNumber.toString());
};

// Read input from standard input and pass it to the processing function
ProcessInput( require('fs') . readFileSync('/dev/stdin' , 'utf8') );