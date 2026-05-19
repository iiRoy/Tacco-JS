function ProcessInput(rawData) {
    // Remove any leading or trailing whitespace from the raw input string.
    let cleanedInput = rawData.trim();
    // Create a shallow copy of the string. This operation doesn't alter the content.
    let copiedInput = cleanedInput.slice();
    // Divide the input string into an array of lines, using the newline character as a delimiter.
    let lineSegments = copiedInput.split("\n");
    // Process each line: split it into an array of substrings based on spaces.
    let processedLines = lineSegments.map(segmentItem => segmentItem.split(" "));
    
    // Parse the elements of the first processed line into an array of integers.
    let firstLineNumericValues = processedLines[0].map(segmentItem => parseInt(segmentItem));
    // Parse the elements of the second processed line into an array of integers.
    let secondLineNumericValues = processedLines[1].map(segmentItem => parseInt(segmentItem));    
    // Take the first element of the third processed line and split it into individual characters.
    let characterSequence = processedLines[2][0].split("");

    // Determine initial point values based on the character sequence.
    let initialPointValues = characterSequence.map(charElement => {
        if (charElement === "r") { // If the character is 'r'
            return secondLineNumericValues[2]; // Use the third value from the second line.
        } else if (charElement === "s") { // If the character is 's'
            return secondLineNumericValues[0]; // Use the first value from the second line.
        } else { // Otherwise (implicitly 'p')
            return secondLineNumericValues[1]; // Use the second value from the second line.
        }
    });        

    // Apply a specific rule to modify the point values.
    initialPointValues.forEach((currentValue, indexPosition, pointCollection) => {
        // Check if the current point value matches a point value at a future position.
        // The future position is determined by adding the second number from the first line.
        if (currentValue === pointCollection[indexPosition + firstLineNumericValues[1]]) {
            // If they match, set the point value at that future position to zero.
            pointCollection[indexPosition + firstLineNumericValues[1]] = 0;
        }
    });

    // Calculate the total sum of all modified point values.
    let finalCalculatedScore = initialPointValues.reduce((previousAccumulation, currentPoint) => previousAccumulation + currentPoint, 0);
    // Display the final calculated score to the console.
    console.log(finalCalculatedScore);
}

// Read the entire content of standard input as a UTF-8 string and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
