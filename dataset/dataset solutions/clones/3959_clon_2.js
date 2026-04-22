// --- Core Input/Output Handler Module Start --- //

// Establish a readline interface for managing standard input and output streams.
var lineReader = require('readline').createInterface({
    input:  process.stdin,  // Direct input from the console
    output: process.stdout  // Direct output to the console
});

// A global object to handle parsed input lines, initialized later.
var inputHandler;

// An array to buffer all lines received from the input stream.
var capturedLines = [];

// Event listener: when a new line of input is detected, add it to our buffer.
lineReader.on('line', function(incomingLine) {
    capturedLines.push(incomingLine);
});

// Event listener: once the input stream is closed, begin processing.
lineReader.on('close', function() {
    // Initialize the input processing utility with all collected lines.
    inputHandler = setupInputProcessor(capturedLines);
    
    // Output a debug message indicating the start of the primary execution.
    logDiagnostic("--- Application Main Routine Initiated ---");
    
    // Capture the timestamp before the main logic begins to measure performance.
    var operationStartTime = new Date();
    
    // Invoke the central function that contains the application's core algorithm.
    RunCoreLogic();
    
    // Calculate the total time elapsed since the operation began.
    var elapsedDuration = new Date() - operationStartTime;
    
    // Output a debug message confirming the completion of the primary execution.
    logDiagnostic("--- Application Main Routine Concluded ---");
    
    // Display the total execution time in milliseconds.
    logDiagnostic("Total processing time : " + (elapsedDuration) + "ms");
    // Display the current memory usage of the heap in kilobytes.
    logDiagnostic("Memory allocated : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

// Function to fetch the next input item and convert it to an integer.
function retrieveNextInteger() { 
    return performDataTransformation(fetchNextItem(), 1); 
} 

// Function to fetch the next input item and split it into an array of strings.
function retrieveNextStringArray() { 
    return performDataTransformation(fetchNextItem(), 2); 
}

// Function to fetch the next input item, split it, and convert elements to integers.
function retrieveNextIntegerArray() { 
    return performDataTransformation(fetchNextItem(), 4); 
} 

// Function to fetch the next input item and split it into an array of characters.
function retrieveNextCharacterArray() { 
    return performDataTransformation(fetchNextItem(), 6); 
}

// Function to get the next raw input line from the handler.
function fetchNextItem() { 
    return inputHandler.fetchNext(); 
} 

// Function to check if there are more lines available in the input stream.
function hasRemainingItems() { 
    return inputHandler.hasMore(); 
}

/**
 * Creates and returns an object designed to manage and parse a list of input strings.
 * This utility provides methods to sequentially access and verify the availability of input lines.
 * @param {Array<string>} sourceContent - An array of strings, each representing an input line.
 * @returns {object} An input processor instance with navigation and retrieval capabilities.
 */
function setupInputProcessor(sourceContent) {  
    var processorInstance = {
        sourceContent : sourceContent,              // The complete array of input lines.
        readIndex     : 0,                          // The current position for reading in the array.
        totalEntries  : sourceContent.length,       // The total number of lines available.
        
        /**
         * Determines if there are any unread lines remaining in the input buffer.
         * @returns {boolean} True if more lines can be read, false otherwise.
         */
        hasMore : function() {
            return (this.readIndex < this.totalEntries);
        },
        
        /**
         * Retrieves the next available input line and advances the read pointer.
         * Throws an error if no more lines are available.
         * @returns {string} The next line of input.
         * @throws {Error} If attempting to read beyond the end of the input.
         */
        fetchNext : function() {
            if (!this.hasMore()) {
                throw new Error("InputBufferExhausted: Attempted to read past the end of available input.");
            } else {
                var currentEntry = this.sourceContent[this.readIndex];
                this.readIndex++; // Increment the index for the next read operation.
                return currentEntry;
            }
        }
    };
    return processorInstance;
}

// Function to display a given message to standard output (console.log).
function outputResult(message) {
    console.log(message);
}

// Function to output detailed debug information to standard error (console.error).
// It uses Node.js's 'util.inspect' for comprehensive object inspection.
function logDiagnostic(debugInformation) {
    console.error("Diagnostic Log: " + require("util").inspect(debugInformation, false, null));
}

/**
 * Generic data transformation utility. It applies various operations on input data
 * based on a specified transformation type code.
 *
 * Supported Transformation Types:
 *   - 1: Parses the input string into an integer.
 *   - 2: Splits the input string by spaces into an array of strings.
 *   - 4: Splits the input string by spaces and converts each part to a number, returning a number array.
 *   - 6: Splits the input string into an array of individual characters.
 *   - 7: Splits the input string into characters and converts each character to a number.
 *   - 8: Joins elements of an array with a single space as a separator.
 *   - 9: Joins elements of an array with a newline character as a separator.
 *   - 0: Joins elements of an array without any separator.
 *   - Default: Returns the input data without any modification.
 *
 * @param {any} inputData - The data to be transformed (can be string or array).
 * @param {number} transformType - An integer code specifying the desired transformation.
 * @returns {any} The result of the transformation, or the original inputData if an error occurs or type is unknown.
 */
function performDataTransformation(inputData, transformType) {
    try {
        switch (transformType) {
            case 1:  return parseInt(inputData);                     // Convert to integer
            case 2:  return inputData.split(" ");                    // Split by space to string array
            case 4:  return inputData.split(" ").map(Number);        // Split by space to number array
            case 6:  return inputData.split("");                     // Split to char array
            case 7:  return inputData.split("").map(Number);         // Split to char array then to number array
            case 8:  return inputData.join(" ");                     // Join array with spaces
            case 9:  return inputData.join("\n");                    // Join array with newlines
            case 0:  return inputData.join("");                      // Join array without separator
            default: return inputData;                               // No transformation
        }
    } catch (conversionError) {
        // If any error occurs during transformation, return the original data.
        return inputData;
    }
}

// --- Core Input/Output Handler Module End --- //


/**
 * This is the primary function containing the application's main logic.
 * It reads two numerical parameters from input, initializes a visual grid,
 * systematically modifies specific cells within this grid based on the parameters,
 * and finally prints the entire modified grid to the console.
 */
function RunCoreLogic() {
    // Retrieve the first line of input, expected to contain two space-separated integers.
    var parsedLineOne = retrieveNextIntegerArray();
    
    // Extract the first numerical parameter from the parsed input.
    var paramA = parsedLineOne[0];
    // Extract the second numerical parameter from the parsed input.
    var paramB = parsedLineOne[1];
    
    // Define the fixed square dimension for our grid structure.
    const gridExtent = 100;
    
    // Initialize a new two-dimensional array (matrix) to represent the grid cells.
    var displayGrid = new Array(gridExtent);
    
    // Populate the initial state of the grid.
    // The grid is divided into two halves: the upper 50 rows and the lower 50 rows.
    for (var currentLoopIndex = 0; currentLoopIndex < gridExtent; currentLoopIndex++) {
        if (currentLoopIndex < 50) {
            // Rows 0-49 are initially filled with '#' characters.
            displayGrid[currentLoopIndex] = new Array(gridExtent).fill("#");
        } else {
            // Rows 50-99 are initially filled with '.' characters.
            displayGrid[currentLoopIndex] = new Array(gridExtent).fill(".");
        }
    }
    
    // Apply modifications based on 'paramA'.
    // For (paramA - 1) iterations, a '#' character in the upper half is changed to '.'.
    // This effectively "clears" a certain number of cells in the solid '#' region.
    for (var currentLoopIndex = 0; currentLoopIndex < paramA - 1; currentLoopIndex++) {
        // Calculate the column coordinate for the cell to be modified.
        // The pattern ensures cells are spread out horizontally.
        var colPosition = (currentLoopIndex * 2) % gridExtent;
        // Calculate the row coordinate for the cell to be modified.
        // This ensures the modification occurs in the upper half of the grid.
        var rowPosition = Math.floor(currentLoopIndex / gridExtent) * 2;
        
        // Update the character at the determined grid position.
        displayGrid[rowPosition][colPosition] = ".";
    }
    
    // Apply modifications based on 'paramB'.
    // For (paramB - 1) iterations, a '.' character in the lower half is changed to '#'.
    // This effectively "fills" a certain number of cells in the empty '.' region.
    for (var currentLoopIndex = 0; currentLoopIndex < paramB - 1; currentLoopIndex++) {
        // Calculate the column coordinate for the cell to be modified.
        // The pattern ensures cells are spread out horizontally.
        var colPosition = (currentLoopIndex * 2) % gridExtent;
        // Calculate the row coordinate for the cell to be modified.
        // The offset (+51) ensures the modification occurs in the lower half of the grid.
        var rowPosition = Math.floor(currentLoopIndex / gridExtent) * 2 + 51;
        
        // Update the character at the determined grid position.
        displayGrid[rowPosition][colPosition] = "#";
    }
    
    // Output the dimensions of the final grid, formatted as "WIDTH HEIGHT".
    outputResult(gridExtent + " " + gridExtent);
    
    // Iterate through each row of the modified grid.
    // Each row (an array of characters) is joined into a single string
    // and then printed to the console as a line.
    for (var currentLoopIndex = 0; currentLoopIndex < gridExtent; currentLoopIndex++) {
        outputResult(performDataTransformation(displayGrid[currentLoopIndex], 0));
    }
}