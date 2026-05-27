const inputReader = require("readline");

let dataStorage = []; // Array to hold input lines
const lineProcessor = inputReader.createInterface({
    input: process.stdin,
    output: process.stdout
});

// This generator function handles asynchronous input
const inputGenerator = (function* () {
    // Helper function to wait for a single line of input
    const fetchLine = () => lineProcessor.once("line", (inputString) => inputGenerator.next(inputString));

    let currentLine;

    // First input line
    currentLine = yield fetchLine();
    dataStorage.push(currentLine);

    // Second input line
    currentLine = yield fetchLine();
    dataStorage.push(currentLine);

    // Third input line
    currentLine = yield fetchLine();
    dataStorage.push(currentLine);

    // Perform calculations based on the collected data
    dataStorage[0] -= dataStorage[1];
    dataStorage[0] %= dataStorage[2];

    // Output the final result
    console.log(dataStorage[0]);

    // Terminate the process
    process.exit();
})();

// Start the generator to prompt for the first input
inputGenerator.next();
