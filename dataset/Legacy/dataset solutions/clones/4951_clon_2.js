// This function processes the provided string data.
function ProcessInput(rawData) {
    // The raw data is split into an array of strings based on newline characters.
    // This array will hold each line as a separate element.
    let processedLines = rawData.split('\n');

    // Extract the first four elements from the processed lines array.
    // This represents the initial part of the data.
    const initialSegment = processedLines.slice(0, 4);

    // Extract all elements from the fifth element onwards.
    // This represents the latter part of the data.
    const remainingSegment = processedLines.slice(4);

    // Display the combined segments to the console, separated by a space.
    console.log(initialSegment + ' ' + remainingSegment);
}

// Do not modify the following line, it handles reading input from standard input.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
