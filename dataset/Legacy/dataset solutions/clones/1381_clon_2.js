function ProcessInputData (rawTextContent) {
    // This function processes the raw text content from standard input.
    // It splits the content by newlines, removes the first line,
    // sorts the remaining lines alphabetically, and then prints the first one.

    // Split the entire input string into an array of individual lines.
    const lineArray = rawTextContent.split("\n");

    // Create a new array containing all lines except the very first one.
    const dataLines = lineArray.slice(1);

    // Sort the array of data lines in alphabetical (lexicographical) order.
    const sortedData = dataLines.sort();

    // Output the first element of the sorted data array to the console.
    console.log(sortedData[0]);
}

// This part of the script is responsible for reading the input data.
// It utilizes Node.js's built-in 'fs' (file system) module.
const fileSystemUtility = require("fs");

// Define the standard input file path, common in Unix-like systems.
const standardInputFilePath = "/dev/stdin";

// Specify the character encoding to use when reading the file content.
const textEncoding = "utf8";

// Synchronously read the entire content of the standard input file.
// The result is a string containing all the input data.
const fullInputString = fileSystemUtility.readFileSync(standardInputFilePath, textEncoding);

// Invoke the main data processing function with the string obtained from standard input.
ProcessInputData(fullInputString);
