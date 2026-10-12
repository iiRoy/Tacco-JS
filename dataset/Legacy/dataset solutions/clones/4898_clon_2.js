const stdioInterface = require('readline'); // Import the 'readline' module for input/output operations

// Create an interface to handle standard input and output streams
const inputOutputHandler = stdioInterface.createInterface({
    input: process.stdin, // Use standard input as the source
    output: process.stdout // Use standard output for displaying results
});

// Prompt the user for a line of input and process it
inputOutputHandler.question('', (inputLine) => {
    let idx; // Iterator for traversing the input string
    let startScanIdx = 0; // Stores the index of the last 'C' character found, defaults to 0
    let cFound = 0; // A flag to indicate if the character 'C' was found (0 for no, 1 for yes)
    let fFound = 0; // A flag to indicate if the character 'F' was found after 'C' (0 for no, 1 for yes)

    // First loop: Iterate through the entire input string to find the last occurrence of 'C'
    for (idx = 0; idx < inputLine.length; idx++) {
        const charVal = inputLine[idx]; // Get the character at the current position
        if (charVal === 'C') {
            cFound = 1; // Set the flag to 1 as 'C' has been located
            startScanIdx = idx; // Update the starting index for the subsequent scan to this position
        }
    }

    // Second loop: Scan the string starting from 'startScanIdx' to find any 'F' character
    let currentChPosition = startScanIdx; // Initialize the position for this scan
    while (currentChPosition < inputLine.length) {
        const currentCh = inputLine[currentChPosition]; // Retrieve the character at the current position
        if (currentCh === 'F') {
            fFound = 1; // Set the flag to 1 if 'F' is encountered
        }
        currentChPosition++; // Move to the next character in the string
    }

    // Compare the two flags to determine the final output
    if (cFound === fFound) {
        console.log("Yes"); // If both flags are the same (both 0 or both 1), print "Yes"
    } else {
        console.log("No"); // Otherwise (one is 0 and the other is 1), print "No"
    }

    // Close the input/output interface to release resources
    inputOutputHandler.close();
});
