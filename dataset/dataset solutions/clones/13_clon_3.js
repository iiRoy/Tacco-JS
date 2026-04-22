// Standard input processing module setup
const ioModule = require('fs');

// Function to read all standard input synchronously
// This approach reads the entire content into a buffer first.
function acquireAllStandardInput() {
    const standardInputFileDescriptor = process.stdin.fd;
    let inputContentSize = 0;
    try {
        inputContentSize = ioModule.fstatSync(standardInputFileDescriptor).size;
    } catch (error) {
        console.error("Error determining standard input size:", error.message);
        return []; // Return empty array if unable to read size
    }

    if (inputContentSize === 0) {
        return [];
    }

    // Allocate buffer for the input content
    const inputDataBuffer = Buffer.alloc(inputContentSize);
    let actualBytesRead = 0;
    try {
        // Read data from standard input into the buffer
        actualBytesRead = ioModule.readSync(standardInputFileDescriptor, inputDataBuffer, 0, inputContentSize, 0);
    } catch (error) {
        console.error("Error reading standard input buffer:", error.message);
        return [];
    }

    if (actualBytesRead === 0) {
        return [];
    }

    // Convert buffer to UTF-8 string and split into lines
    const rawInputString = inputDataBuffer.toString('utf8', 0, actualBytesRead);
    // Filter out any empty lines that might result from extra newlines at the end or in between
    const processedInputLines = rawInputString.split('\n').filter(line => line.trim() !== '');
    
    return processedInputLines;
}

// Global variable to store parsed input lines, populated immediately
const allInputLines = acquireAllStandardInput();

/**
 * Helper function to check if three numbers form a Pythagorean triple.
 * Assumes numbers are already sorted in ascending order (sideOne <= sideTwo <= hypotenuseCandidate).
 * @param {number} sideOne - The smallest side.
 * @param {number} sideTwo - The middle side.
 * @param {number} hypotenuseCandidate - The largest side, which would be the hypotenuse.
 * @returns {boolean} True if they form a Pythagorean triple, false otherwise.
 */
function checkPythagoreanProperty(sideOne, sideTwo, hypotenuseCandidate) {
    // Perform basic validation for numeric inputs
    if (isNaN(sideOne) || isNaN(sideTwo) || isNaN(hypotenuseCandidate)) {
        return false;
    }
    // Calculate squares and check for equality using strict comparison
    return Math.pow(hypotenuseCandidate, 2) === Math.pow(sideOne, 2) + Math.pow(sideTwo, 2);
}

// Main application logic entry point
function processInputData() {
    // Guard clause: Exit if no input lines were successfully read
    if (allInputLines.length === 0) {
        return;
    }

    // Attempt to parse the first line, which indicates the total number of test cases
    const totalTestCasesString = allInputLines[0];
    const numberOfScenarios = parseInt(totalTestCasesString, 10);

    // Validate the parsed number of scenarios
    if (isNaN(numberOfScenarios) || numberOfScenarios < 0) {
        console.error("Invalid number of test scenarios specified: " + totalTestCasesString);
        return; // Exit if the number of scenarios is invalid
    }

    // Iterate through each test case, starting from the second line of input
    for (let currentScenarioIdx = 1; currentScenarioIdx <= numberOfScenarios; currentScenarioIdx++) {
        const currentDataLine = allInputLines[currentScenarioIdx];

        // Guard clause: If a line is missing for a scenario, output "NO" and continue
        if (!currentDataLine) {
            console.log("NO");
            continue;
        }

        // Split the line by spaces, filtering out any empty strings that might result from multiple spaces
        const stringComponents = currentDataLine.split(' ').filter(s => s.trim() !== '');

        // Validate that exactly three components (numbers) were provided for the current scenario
        if (stringComponents.length !== 3) {
            console.log("NO");
            continue;
        }

        // Convert string components to numbers and filter out any non-numeric values
        const numericSides = stringComponents.map(Number).filter(num => !isNaN(num));

        // Validate that all three components successfully converted to valid numbers
        if (numericSides.length !== 3) {
            console.log("NO");
            continue;
        }

        // Sort the numbers in ascending order to easily identify the shortest, middle, and longest sides
        numericSides.sort((valA, valB) => valA - valB);

        // Assign sorted values to descriptive variables
        const sideA = numericSides[0];
        const sideB = numericSides[1];
        const hypotenuseCandidate = numericSides[2];

        // Use the helper function to determine if it's a Pythagorean triple
        const isPythagorean = checkPythagoreanProperty(sideA, sideB, hypotenuseCandidate);
        
        // Output the result for the current scenario
        console.log(isPythagorean ? 'YES' : 'NO');
    }
}

// Execute the main processing function to start the application
processInputData();