const inputContent = require('fs').readFileSync('/dev/stdin', 'utf8'); // Retrieve all content from the standard input stream.
const processedLines = inputContent.split('\n'); // Divide the input content into an array of individual string rows.

// Cycle through each row of the collected data.
for (let lineIndex = 0, totalLines = processedLines.length; lineIndex < totalLines; lineIndex++) {
    // Generate a user-friendly case number, starting from one for better readability.
    const displayCaseNum = lineIndex + 1;
    // Print the current scenario's output to the console, including its sequential number.
    console.log('Scenario ' + displayCaseNum + ':' + processedLines[lineIndex]);
}