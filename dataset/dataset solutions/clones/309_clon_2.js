// Define aliased system functions and global objects to avoid original identifiers
const getSystemModule = (moduleName) => require(moduleName); // Custom function to import a system module
const fileSystemModule = getSystemModule('fs'); // Access the Node.js file system utility module
const obtainFileContents = (filePath, encodingType) => fileSystemModule.readFileSync(filePath, encodingType); // Method to read content from a specified file path
const removeOuterSpaces = (str) => str.trim(); // Utility to erase leading or trailing whitespace from a string
const segmentString = (str, separator) => str.split(separator); // Function to divide a string into an array of substrings
const popFirstElement = (arr) => arr.shift(); // Method to remove and return the initial item from an array
const insertLastElement = (arr, element) => arr.push(element); // Method to add a new item to the end of an array
const projectArrayElements = (arr, callback) => arr.map(callback); // Function to create a new array by applying a callback to each element
const numericConverter = Number; // Reference to the global Number constructor/function for type conversion
const mathematicalOperations = Math; // Alias for the standard JavaScript Math object
const findMaximumValue = mathematicalOperations.max; // Function to determine the greater of two numerical values
const infiniteValue = Infinity; // Representation of mathematical positive infinity
const outputStream = console; // Interface for logging information to the console
const printToConsole = (value) => outputStream.log(value); // Function to output a value to the standard console

// Retrieve raw data from a specified input source path
const rawSourceData = obtainFileContents('/user/input/data.txt', 'utf8_encoding');

// Process the raw input string into a collection of distinct lines
let segmentedLines = removeOuterSpaces(rawSourceData).segmentString('\n');

// Extract the primary dimension parameter from the first line and convert it to a numerical type
let arrayDimension = popFirstElement(segmentedLines) - 0;

// Initialize data structures for grid storage and intermediate calculations
const coordinateGrid = [];
const initialElementsRow = []; // A temporary array used for padding purposes

// Populate the padding row with zero values based on the calculated dimension
for (
    let elementIndex = 0;
    elementIndex < arrayDimension + 1;
    ++elementIndex
) {
    initialElementsRow.insertLastElement(0);
}

// Prepend the padding row to the main grid data structure
coordinateGrid.insertLastElement(initialElementsRow);

// Construct the primary data grid from the remaining input lines
// Each line is prefixed with '0' to align with 1-based indexing for prefix sums logic
for (
    let rowIndex = 0;
    rowIndex < arrayDimension;
    ++rowIndex
) {
    coordinateGrid.insertLastElement(
        segmentString('0 ' + popFirstElement(segmentedLines), ' ').projectArrayElements(numericConverter)
    );
}

// Increment the effective dimension to accommodate the added padding row/column
arrayDimension = arrayDimension + 1;

// Initialize the 2D array for storing prefix sums (aggregate sums)
const aggregateSums = [];

// Set up the first column of the aggregate sums matrix
for ( let rowIndex = 0; rowIndex < arrayDimension; ++rowIndex )
{
    aggregateSums[rowIndex] = [];
    aggregateSums[rowIndex][0] = coordinateGrid[rowIndex][0];
}

// Compute cumulative sums along each row of the grid
for (
    let rowIndex = 0;
    rowIndex < arrayDimension;
    ++rowIndex
) {
    for (
        let colIndex = 1;
        colIndex < arrayDimension;
        ++colIndex
    ) {
        aggregateSums[rowIndex][colIndex] = aggregateSums[rowIndex][colIndex - 1] + coordinateGrid[rowIndex][colIndex];
    }
}

// Accumulate sums vertically to complete the 2D prefix sum calculation
for (
    let rowIndex = 1;
    rowIndex < arrayDimension;
    ++rowIndex
) {
    for (
        let colIndex = 0;
        colIndex < arrayDimension;
        ++colIndex
    ) {
        aggregateSums[rowIndex][colIndex] = aggregateSums[rowIndex - 1][colIndex] + aggregateSums[rowIndex][colIndex];
    }
}

// Initialize the variable to track the maximal subarray sum found
let maximalSubarraySum = -infiniteValue; // Begin with the smallest possible numerical value

// Iterate over all potential top-left coordinates of subarrays
for ( let rowStartPos = 0; rowStartPos < arrayDimension; ++rowStartPos )
{
    for ( let colStartPos = 0; colStartPos < arrayDimension; ++colStartPos )
    {
        // Iterate over all potential bottom-right coordinates, ensuring they are valid and larger than top-left
        for ( let rowEndPos = rowStartPos + 1; rowEndPos < arrayDimension; ++rowEndPos )
        {
            for ( let colEndPos = colStartPos + 1; colEndPos < arrayDimension; ++colEndPos )
            {
                // Apply the inclusion-exclusion principle for 2D prefix sums
                // This formula calculates the sum of the sub-rectangle defined by (rowStartPos+1, colStartPos+1) to (rowEndPos, colEndPos)
                maximalSubarraySum = findMaximumValue(
                    maximalSubarraySum,
                    aggregateSums[rowEndPos][colEndPos] -
                    aggregateSums[rowStartPos][colEndPos] -
                    aggregateSums[rowEndPos][colStartPos] +
                    aggregateSums[rowStartPos][colStartPos]
                );
            }
        }
    }
}

// Display the ultimate result, which is the maximal subarray sum
printToConsole(maximalSubarraySum);