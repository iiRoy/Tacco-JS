// This utility module provides access to the file system functionalities.
const fileSystemUtility = require("fs");

// Designating the standard input file path for reading data.
const inputFilePath = "/dev/stdin";

// A constant to specify how many of the largest values should be displayed.
const topValuesCount = 3;

/**
 * Reads content from a specified file path.
 * @param {string} path The file path to read from.
 * @returns {string} The raw content of the file as a UTF-8 string.
 */
function acquireSourceContent(path) {
  return fileSystemUtility.readFileSync(path, "utf8");
}

/**
 * Processes a string of raw data, parsing it into numbers and sorting them in descending order.
 * @param {string} rawDataString The input string containing newline-separated values.
 * @returns {Array<number>} An array of numbers, sorted from largest to smallest.
 */
function parseAndOrderNumericData(rawDataString) {
  // Split the input string by various newline characters (CRLF or LF)
  // Then, remove any empty string segments that might result from splitting.
  // Finally, convert each remaining string segment into a numerical type.
  const numericalDataCollection = rawDataString
    .split(/\r?\n/)
    .filter(lineSegment => lineSegment.trim().length > 0)
    .map(strValue => Number(strValue));

  // Apply a custom sort function to arrange the numbers in descending order.
  // This means that `valueB` (the second element in a pair) minus `valueA` (the first)
  // will dictate the order: a positive result means `valueB` is larger and comes first.
  numericalDataCollection.sort((valueA, valueB) => valueB - valueA);

  return numericalDataCollection;
}

// Fetch the raw text content from the designated input source.
// (Note: The original code used 'this.result' which is not typical for direct 'fs.readFileSync' output.
// It's assumed 'input' from 'readFileSync' was the intended source of data for processing).
const initialContent = acquireSourceContent(inputFilePath);

// Process the raw content to get a sorted array of numerical measurements.
const processedAndSortedMeasurements = parseAndOrderNumericData(initialContent);

// Iterate through the first 'topValuesCount' elements of the sorted array
// and output each one to the console.
// The .slice() method ensures we only attempt to access available elements,
// even if the array has fewer items than 'topValuesCount'.
processedAndSortedMeasurements.slice(0, topValuesCount).forEach(itemToLog => {
  console.log(itemToLog);
});