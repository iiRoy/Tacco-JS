function processSequenceData(rawSequenceText) {
    // Separate the input text into individual lines
    const lineSegments = rawSequenceText.split('\n');
    // Parse the total number of characters from the first line
    const totalLength = Number(lineSegments[0]);
    // Obtain the character sequence from the second line
    const symbolSeries = lineSegments[1];

    // Initialize arrays to store the indices of each color type
    const redPositions = [];
    const greenPositions = [];
    const bluePositions = [];

    // Iterate through the symbol series to categorize and store indices
    symbolSeries.split('').forEach((currentSymbol, symbolIndex) => {
        // If the current character is 'R', record its position
        if (currentSymbol === 'R') {
            redPositions.push(symbolIndex);
        }
        // If the current character is 'G', record its position
        if (currentSymbol === 'G') {
            greenPositions.push(symbolIndex);
        }
        // If the current character is 'B', record its position
        if (currentSymbol === 'B') {
            bluePositions.push(symbolIndex);
        }
    });


    // Calculate the initial product of the counts of each color
    // This represents the total possible combinations without any constraints
    let overallProduct = redPositions.length * bluePositions.length * greenPositions.length;

    // Initialize a counter for combinations that violate the specific distance rule
    let excludedCases = 0;

    // Iterate through all possible first positions
    for (let firstPosition = 0; firstPosition < totalLength; firstPosition++) {
        // Iterate through all possible second positions, ensuring it's after the first
        for (let secondPosition = firstPosition + 1; secondPosition < totalLength - 1; secondPosition++) {
            // Calculate the potential third position based on the arithmetic progression
            // where the distance between first and second is the same as second and third
            const thirdPosition = secondPosition * 2 - firstPosition;

            // Check if the calculated third position is within the bounds of the sequence
            if (thirdPosition < totalLength) {
                // If the characters at firstPosition, secondPosition, and thirdPosition are all distinct
                // and the distance condition (k-j == j-i) is met, then this combination is an exclusion
                if (symbolSeries[firstPosition] !== symbolSeries[secondPosition] &&
                    symbolSeries[secondPosition] !== symbolSeries[thirdPosition] &&
                    symbolSeries[firstPosition] !== symbolSeries[thirdPosition]) {
                    // Increment the count of excluded combinations
                    excludedCases++;
                }
            }
        }
    }

    // Output the final result: total combinations minus the excluded ones
    console.log(overallProduct - excludedCases);

}

// Read input from standard input and pass it to the processing function
processSequenceData(require("fs").readFileSync("/dev/stdin", "utf8"));