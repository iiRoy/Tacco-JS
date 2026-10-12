function ProcessInput(rawData) {
    // Prepare the input data for parsing
    initializeParser(rawData);

    // Read two integer values from the processed input
    let valA = readIntegerToken();
    let valB = readIntegerToken();

    // Calculate the result and format it to 10 decimal places
    let calculationResult = ((valA * valB) / (valA + valB)).toFixed(10);

    // Output the final result followed by a newline
    printLine(calculationResult);
}

// Global variables for input parsing
let parsedTokens;
let tokenIndex;

// Function for debugging purposes, typically run in a browser environment
function runDebugger() {
    // Retrieve input from a DOM element and pass it to the main processing function
    ProcessInput(document.getElementById("input").value);
}

// Initializes the input parsing mechanism
function initializeParser(rawData) {
    // Replace all newline characters with spaces and then split the string by spaces
    // This creates an array of string tokens
    parsedTokens = rawData.replace(/\n/g, " ").split(" ");
    // Reset the token index to the beginning of the array
    tokenIndex = 0;
}

// Utility function to print a value to the console
const printOutput = (dataToPrint) => {
    console.log(dataToPrint);
};

// Utility function to print a value to the console followed by a newline
const printLine = (dataToPrint) => {
    console.log(dataToPrint + "\n");
};

// Utility function to read the next string token from the input array
const readStringToken = () => {
    return parsedTokens[tokenIndex++];
};

// Utility function to read the next token as an integer
const readIntegerToken = () => {
    return parseInt(readStringToken(), 10);
};

// Utility function to read the next token as a floating-point number
const readFloatToken = () => {
    return parseFloat(readStringToken());
};

// This section handles standard input/output for Node.js environments.
// It should not be modified.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
