const ProcessInput = (rawData) => {
    // Split the incoming data into individual lines
    let lineSegments = rawData.split('\n');

    // Extract the first line and convert it into an array of characters
    let firstSequence = lineSegments[0].split('');

    // Extract the second line and convert it into an array of characters
    let secondSequence = lineSegments[1].split('');

    // Initialize a counter for matching characters
    let matchCount = 0;

    // Iterate through the characters of the first sequence
    for (let charPosition = 0; charPosition < firstSequence.length; charPosition++) {
        // Check if the character at the current position in both sequences is identical
        if (firstSequence[charPosition] === secondSequence[charPosition]) {
            // If they match, increment the counter
            matchCount++;
        }
    }

    // Output the final count of matching characters to the console
    console.log(matchCount);
};

// Read input from standard input and pass it to the processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
