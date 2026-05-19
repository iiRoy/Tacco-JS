function ProcessInput(rawData) {
    // Divide the entire incoming text by newline characters.
    let processedLines = rawData.split('\n');

    // Extract the second line (at index 1) and then segment it by spaces.
    let tokenizedLine = processedLines[1].split(' ') ;

    // Initialize a status indicator to a null state.
    let foundIndicator = null;

    // Traverse through the elements of the segmented line, excluding the final one.
    for (let idx = 0; idx < tokenizedLine.length - 1; idx++) {
        // If the current element matches the character 'Y',
        if (tokenizedLine[idx] === 'Y') {
            // Set the indicator to true, signifying 'Y' was found.
            foundIndicator = true;
        }
    }

    // Based on the final state of the indicator, output a specific word.
    if (foundIndicator) {
        console.log('Four');
    } else {
        console.log('Three');
    }
}

// Read the content from standard input synchronously and pass it to the processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
