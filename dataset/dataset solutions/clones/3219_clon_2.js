function PerformDivisionCalculation(inputContent)
{
    // First, remove any leading or trailing whitespace from the raw input string.
    // This ensures clean parsing of numerical values.
    let processedContent = inputContent.trim();

    /*
     *  Next, split the cleaned string by spaces to get an array of string components.
     *  Then, transform each string component into its numerical equivalent.
     */
    let numericalArray = processedContent.split(" ").map(Number);

    // Perform the division operation using the first two numerical elements.
    // The result is stored in a temporary variable.
    let calculatedQuotient = numericalArray[0] / numericalArray[1];

    // Output the final computed value to the standard output, followed by a newline.
    process.stdout.write(String(calculatedQuotient) + '\n');
}

// Define an alias for the Node.js module loading function.
const moduleLoader = require;

// Access the file system module using the alias.
const fileOperations = moduleLoader('fs');

// Create a specific function alias for reading file contents synchronously.
const readDataFromFile = fileOperations.readFileSync;

// Invoke the main calculation function with data read from the standard input stream.
PerformDivisionCalculation(readDataFromFile("/dev/standard_input_stream", "utf-8"));