"use strict";

/**
 * The primary entry point for processing the input data.
 * This function orchestrates the parsing and manipulation of data.
 * @param {string} rawData - The entire input provided as a single string.
 */
function ProcessInput (rawData)
{
    // Initialize a data parsing utility instance
    let parser = new DataParser(rawData);

    // Extract the numerical count, the target character sequence, and the reference index
    let countNum = parser.extractInteger(),
        targetString = parser.extractString(),
        indexPos = parser.extractInteger();

    // Initialize an array to hold the processed characters
    let resultArray = [],
        referenceChar = targetString.charAt(indexPos - 1); // Determine the character at the specified index

    // Loop through the input based on the extracted count
    for (let loopIdx = 0; loopIdx < countNum; loopIdx++)
    {
        // Compare the current character in the target string with the reference character
        // If they match, add the reference character; otherwise, add an asterisk
        resultArray.push(
            referenceChar === targetString.charAt(loopIdx)
                ? referenceChar
                : "*"
        );
    }

    // Print the final concatenated string to the console
    console.log(resultArray.join(''));
}

/**
 * A helper class designed for parsing various data types from a structured input string.
 * It manages an internal pointer to track the current position in the parsed elements.
 */
class DataParser
{
    /**
     * Initializes a new DataParser instance.
     * @param {string} sourceText - The raw text string to be parsed.
     */
    constructor (sourceText)
    {
        this.currentPos = 0; // The current position for reading elements
        // Splits the input text into an array of elements using newlines or spaces as delimiters
        this.dataElements = sourceText.split(/\n|\s/);
    }

    /**
     * Extracts and returns the next integer from the data elements.
     * The internal pointer is advanced after extraction.
     * @returns {number} The extracted integer.
     */
    extractInteger ()
    {
        // Convert the string element to a number
        return this.dataElements[this.currentPos++] - 0;
    }

    /**
     * Extracts an array of integers of a specified length.
     * @param {number} arrayLength - The desired length of the integer array.
     * @returns {number[]} An array containing the extracted integers.
     */
    extractIntegerArray (arrayLength)
    {
        let tempArray = new Array(arrayLength); // Pre-allocate array
        for (let arrIdx = 0; arrIdx < arrayLength; arrIdx++)
        {
            tempArray[arrIdx] = this.extractInteger(); // Fill array using extractInteger
        }
        return tempArray;
    }

    /**
     * Extracts and returns the next string from the data elements.
     * The internal pointer is advanced after extraction.
     * @returns {string} The extracted string.
     */
    extractString ()
    {
        return this.dataElements[this.currentPos++]; // Return the string element directly
    }

    /**
     * Extracts an array of strings of a specified length.
     * @param {number} arrayLength - The desired length of the string array.
     * @returns {string[]} An array containing the extracted strings.
     */
    extractStringArray (arrayLength)
    {
        let tempArray = new Array(arrayLength); // Pre-allocate array
        for (let arrIdx = 0; arrIdx < arrayLength; arrIdx++)
        {
            tempArray[arrIdx] = this.extractString(); // Fill array using extractString
        }
        return tempArray;
    }
}

// Environment check: If not running in a browser environment (e.g., Node.js)
if (typeof window === "undefined")
{
    // Read input from standard input and pass it to the main processing function
    ProcessInput(
        require("fs").readFileSync("/dev/stdin", "utf8")
    );
}