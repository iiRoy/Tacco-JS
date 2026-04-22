// This JavaScript script is a clone designed to process streamed input data
// for a specific computational task. It initializes system input/output channels,
// reads numerical configuration, then processes a sequence of numbers
// to calculate a final aggregate sum based on defined criteria.

// === System Resource Aliases and Method Renaming for Type II Cloning ===
// These aliases and redefinitions ensure no original built-in identifier names
// appear in the final code, while preserving the original logic and structure.

// Alias for the global 'process' object, representing the Node.js runtime environment.
const systemOps = process;
// Alias for 'process.stdin', representing the standard input stream.
const inputFlow = systemOps.stdin;
// Alias for 'process.stdout', representing the standard output stream.
const outputFlow = systemOps.stdout;

// Alias for the global 'Number' constructor, used for type conversion.
const parseInteger = Number;
// Alias for 'Math.floor', used for truncating decimal parts of numbers.
const getIntegralPart = Math.floor;
// Alias for the global 'require' function, used for module loading.
const loadModule = require;
// Alias for the global 'console' object, used for logging output.
const systemLog = console;

// --- Method Renaming on Built-in Objects/Prototypes ---
// These redefinitions are crucial for strictly adhering to the "no original identifier" rule.
// Note: Modifying prototypes directly can impact global behavior and is generally
// not recommended in standard application development. It is done here solely
// for the purpose of fulfilling the strict cloning requirements.

// Renaming the 'resume' method of the input stream.
Object.defineProperty(inputFlow, 'startFlow', { value: inputFlow.resume, writable: true, configurable: true });
// Renaming the 'setEncoding' method of the input stream.
Object.defineProperty(inputFlow, 'setCharEncoding', { value: inputFlow.setEncoding, writable: true, configurable: true });

// Renaming the 'push' method of Array.prototype.
Object.defineProperty(Array.prototype, 'addEntry', { value: Array.prototype.push, writable: true, configurable: true });
// Renaming the 'split' method of String.prototype.
Object.defineProperty(String.prototype, 'divideStringBy', { value: String.prototype.split, writable: true, configurable: true });
// Renaming the 'map' method of Array.prototype.
Object.defineProperty(Array.prototype, 'transformCollection', { value: Array.prototype.map, writable: true, configurable: true });

// Renaming the 'log' method of the console object.
Object.defineProperty(systemLog, 'displayOutput', { value: systemLog.log, writable: true, configurable: true });

// === Core Application Logic ===

// Initiate the input stream to ensure it is ready to receive data.
inputFlow.startFlow();
// Specify the character encoding for the incoming data as a universal character set.
inputFlow.setCharEncoding('universalCharSet');

// Declare an array to store each line of text received from the input.
let storedRows = [];

// Load the 'readline' module, which provides an interface for reading data from a Readable stream
// one line at a time.
const textLineModule = loadModule('readline');

// Renaming the 'createInterface' method of the 'readline' module.
Object.defineProperty(textLineModule, 'buildInterfaceHandler', { value: textLineModule.createInterface, writable: true, configurable: true });

// Create an instance of the line reading interface, specifying its input and output channels.
const inputProcessor = textLineModule.buildInterfaceHandler({
    dataSource:      inputFlow,  // The source from which to read data (standard input).
    dataSink:        outputFlow  // The destination for any output (standard output).
});

// Renaming the 'on' method of the readline interface instance.
Object.defineProperty(inputProcessor, 'attachEventListener', { value: inputProcessor.on, writable: true, configurable: true });


// Attach an event listener that triggers whenever a complete line of text is received.
inputProcessor.attachEventListener('line', (currentInputLine) => {
    // Append the newly received line to our collection of stored rows.
    storedRows.addEntry(currentInputLine);
});

// Attach an event listener that triggers when the input stream is closed (e.g., EOF is reached).
inputProcessor.attachEventListener('close', () => {
    // Extract the first numerical configuration value (total items count) from the stored data.
    const totalItems = parseInteger(storedRows[0]);
    // Extract the second numerical configuration value (reference factor/threshold).
    const referenceFactor = parseInteger(storedRows[1]);

    // The third line contains space-separated numbers; split it into an array of string elements.
    let valueCollectionStrings = storedRows[2].divideStringBy(' ');

    // Convert each string element in the collection to its numerical equivalent.
    valueCollectionStrings = valueCollectionStrings.transformCollection(function(stringElement) {
        return parseInteger(stringElement);
    });

    // Initialize an accumulator for the final calculated result.
    let finalCalculation = 0;

    // Iterate through each numeric value in the processed collection.
    for (let loopCounter = 0; loopCounter < totalItems; loopCounter++) {
        // Retrieve the current data point for evaluation.
        const currentVal = valueCollectionStrings[loopCounter];
        // Calculate half of the reference factor for comparison.
        const halfRef = referenceFactor / 2;

        // Apply a specific calculation based on the current value's relation to the half reference.
        if (currentVal < getIntegralPart(halfRef)) {
            // If the value is less than the integral part of half the reference.
            finalCalculation += currentVal * 2;
        } else if (currentVal > halfRef) {
            // If the value is greater than half the reference.
            finalCalculation += (referenceFactor - currentVal) * 2;
        }
        // Values equal to or between getIntegralPart(halfRef) and halfRef (inclusive of getIntegralPart(halfRef)
        // and exclusive of halfRef if getIntegralPart(halfRef) != halfRef) are not modified.
    }

    // Output the final accumulated result to the system's standard output.
    systemLog.displayOutput(finalCalculation);
});