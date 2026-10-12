function ProcessInput(rawData) {
	// Split the raw input into an array of lines
	let dataLines = rawData.split('\n');
	// Initialize a string variable to hold the current sequence of characters
	let currentString = '';
	// Loop indefinitely to process each line of input
	for (let lineIndex = 0; ; lineIndex++) {
		// Check if the current line is not a number (i.e., it's a string)
		if (isNaN(dataLines[lineIndex])) {
			// If it's not the very first line, output the processed string
			if (lineIndex !== 0) {
				logOutput(currentString);
			}
			// Assign the current line (which is a string) to currentString
			currentString = dataLines[lineIndex];
			// If the string is a hyphen, it signifies the end of input
			if (currentString === '-') {
				break; // Exit the loop
			} else {
				// If it's a new string but not the end marker, increment index to skip the next line (which would be a number for shuffling)
				lineIndex++;
			}
		} else {
			// If the current line is a number, it indicates a shuffle operation
			// Convert the number string to an integer
			let shuffleAmount = convertToInt(dataLines[lineIndex]);
			// Perform the shuffle: take a slice from the shuffle amount to the end,
			// then concatenate it with the slice from the beginning to the shuffle amount.
			currentString = currentString.slice(shuffleAmount) + currentString.slice(0, shuffleAmount);
		}
	}
}

// Helper function for sorting in ascending numerical order
function compareAsc(valueA, valueB) {
    // Returns a negative value if valueA < valueB, 0 if equal, positive if valueA > valueB
    return valueA - valueB;
}

// Helper function for sorting in descending numerical order
function compareDesc(valueA, valueB) {
    // Returns a positive value if valueA < valueB, 0 if equal, negative if valueA > valueB
    return valueB - valueA;
}

// Utility function to convert a string to an integer
function convertToInt(textValue) {
    // Uses parseInt with radix 10 for decimal conversion
    return parseInt(textValue, 10);
}

// Utility function to convert a number to its string representation
function formatNumber(numericValue) {
    // Converts the number to a base-10 string
    return numericValue.toString(10);
}

// Function to handle output, either to a debug console or standard console
function logOutput(messageContent) {
	// If debug mode is active, append to a specific DOM element
	if (_DebugModeActive) {
		document.getElementById("Console").value += (messageContent + "\n");
	}
	// Always log to the standard console
	console.log(messageContent);
}

// Global flag to control debug output
let _DebugModeActive = false;

// Function to activate debug mode and run the main processing with console content
function runDebugProcess() {
	_DebugModeActive = true; // Set debug flag to true
	// Get input from the debug console textarea
	let debugInput = document.getElementById("Console").value;
	// Add a newline for visual separation in the debug console
	document.getElementById("Console").value += "\n";
	// Process the input using the main logic
	ProcessInput(debugInput);
}

// Main execution block: read input from stdin and pass it to the processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
