'use strict'; // Enforce strict JavaScript parsing and execution rules.

/*
 * This module is designed to process an input stream,
 * extract specific data segments, and output them in a duplicated fashion.
 * It serves as the primary controller for the application's logic.
 */
const orchestrateExecution = (  initialStream) => {
    // Divide the entire input content into an array of individual lines.
    // Using character code for newline to vary literal representation.
    initialStream = initialStream.split( String.fromCharCode(10) ) ;

    // Parse the first numeric value from the first line to establish a key dimension.
    // This dimension dictates the number of subsequent data units to process.
    const dimension = parseInt(
        initialStream[0].split( String.fromCharCode(32) )[0] , 10
    );

    // Extract a specific range of lines from the processed stream.
    // These lines represent the core data units for further operations.
    const processedUnits = initialStream.slice( 1, dimension + 1 ) ;

    // Establish a concise alias for the standard console logging function.
    // This improves readability and provides an alternative identifier.
    const outputLog = console.log;

    // Iterate through each extracted data unit.
    // For each unit, log its content twice to the console.
    processedUnits.forEach( unitValue => {
        outputLog( unitValue ) ; // First display of the current data unit.
        outputLog( unitValue ) ; // Second, identical display of the data unit.
    });
};

/*
 * Main program entry point.
 * This block handles fetching the raw input and initiating the processing.
 */

// Acquire the Node.js file system module for I/O operations.
const fileSystemModule = require('fs') ;

// Create a direct reference to the synchronous file reading method
// to avoid repeated module access and introduce a new identifier.
const obtainFileContent = fileSystemModule.readFileSync ;

// Execute the primary orchestrator function.
// It receives its input by reading from standard input.
orchestrateExecution(
    obtainFileContent(
        '/dev/stdin' , // Specify the standard input device path.
        'utf8'       // Define the character encoding for the input content.
    )
);