// Type III Clone - Robust numerical input processing from standard input

// Define a dedicated module for handling file system interactions
const fileSystemHandler = (function() {
    // Internal reference to the Node.js 'fs' module
    let fileSystemModuleReference = null;

    // Private utility to safely acquire the 'fs' module
    const retrieveFsModule = () => {
        if (fileSystemModuleReference === null) {
            try {
                fileSystemModuleReference = require('fs');
            } catch (moduleLoadError) {
                console.error("Critical error: Unable to load Node.js 'fs' module.", moduleLoadError.message);
                throw new Error("Filesystem capabilities are unavailable.");
            }
        }
        return fileSystemModuleReference;
    };

    // Public interface for reading file contents
    return {
        // Method to read the entire content of a file synchronously
        readContentFromFile: function(pathSpecifier, encodingType) {
            try {
                const fsInstance = retrieveFsModule(); // Ensure module is available
                // Synchronously read the file and return its content
                return fsInstance.readFileSync(pathSpecifier, encodingType);
            } catch (fileReadOperationError) {
                console.warn(`Warning: Could not read from path '${pathSpecifier}'. Error:`, fileReadOperationError.message);
                // Return an empty string to allow the program to continue gracefully
                return '';
            }
        }
    };
})(); // End of fileSystemHandler IIFE

// Main application execution block, encapsulated to prevent global scope pollution
(function() {
    // Define a constant for the standard input device path
    const standardInputDevicePath = '/dev/stdin';
    // Define the expected encoding for the input stream
    const expectedEncoding = 'utf8';

    // Fetch the raw data from the standard input stream
    const rawStreamData = fileSystemHandler.readContentFromFile(standardInputDevicePath, expectedEncoding);

    // Function responsible for parsing the textual data into a collection of numbers
    // and then displaying them.
    const processAndDisplayNumericData = function(sourceTextualData) {
        // Perform initial validation on the input string
        if (!sourceTextualData || typeof sourceTextualData !== 'string' || sourceTextualData.trim().length === 0) {
            console.log("Input processing halted: No significant textual data provided.");
            return; // Exit if the source data is invalid or empty
        }

        // Extract the very first line from the potentially multi-line input
        const initialDataLine = sourceTextualData.split('\n')[0].trim();

        // Validate the extracted first line
        if (initialDataLine.length === 0) {
            console.log("No usable content found on the first line of input after trimming whitespace.");
            return;
        }

        // Split the line into individual string tokens using space as a delimiter
        // Filter out any empty strings that might result from multiple consecutive spaces
        const stringTokensArray = initialDataLine.split(' ').filter(token => token.length > 0);

        // If no tokens remain after filtering, there's nothing to convert
        if (stringTokensArray.length === 0) {
            console.log("The input line contained no discernible tokens to convert to numbers.");
            return;
        }

        // Convert each string token into a numeric value
        // Filter out any results that are not a valid number (NaN)
        const resultingNumericCollection = stringTokensArray
            .map(tokenString => {
                const convertedValue = Number(tokenString); // Attempt conversion
                // Optionally, add a warning for tokens that couldn't be converted
                if (isNaN(convertedValue)) {
                    // console.warn(`Non-numeric token encountered and skipped: '${tokenString}'`);
                }
                return convertedValue;
            })
            .filter(value => !isNaN(value)); // Ensure only valid numbers are kept

        // Present the final collection of numbers or a message if none were found
        if (resultingNumericCollection.length > 0) {
            console.log("Successfully extracted and parsed numeric values:", resultingNumericCollection);
        } else {
            console.log("No valid numerical values could be extracted from the provided input line.");
        }
    };

    // Initiate the data processing sequence with the obtained raw input data
    processAndDisplayNumericData(rawStreamData.toString());

})(); // End of main application IIFE