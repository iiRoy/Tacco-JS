// This module processes a given raw data string.
function processInput(rawData) {
    // Trim leading/trailing whitespace from the raw data.
    rawData = rawData.trim();

    // Extract the first numeric value from the first line of the input.
    // Although 'firstNumericValue' is declared, its value is not utilized in this specific logic path.
    let firstNumericValue = parseInt(rawData.split(" ")[0], 10);

    // Parse the second line of the input into an array of individual character codes.
    // Each element is mapped back to itself, effectively creating a new array of strings.
    var colorCodes = rawData.split('\n')[1].split(' ').map((itemChar) => (itemChar));

    // Initialize a counter for the number of distinct color codes found.
    let colorCount = 0;

    // Check for the presence of specific color codes and increment the counter.
    if (colorCodes.indexOf("P") !== -1) {
        colorCount++; // Increment if 'P' (Purple) is found.
    }
    if (colorCodes.indexOf("W") !== -1) {
        colorCount++; // Increment if 'W' (White) is found.
    }
    if (colorCodes.indexOf("G") !== -1) {
        colorCount++; // Increment if 'G' (Green) is found.
    }
    if (colorCodes.indexOf("Y") !== -1) {
        colorCount++; // Increment if 'Y' (Yellow) is found.
    }

    // Determine the output message based on the final count of distinct colors.
    if (colorCount === 3) {
        console.log("Three"); // Output "Three" if exactly three distinct colors were found.
    } else {
        console.log("Four"); // Otherwise, output "Four" (implying four distinct colors were found, as the max is 4).
    }
}

// Execute the primary processing function by reading input from standard input.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));