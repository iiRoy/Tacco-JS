// --- Custom utility functions and prototype extensions to replace built-in identifiers ---

// Extend String prototype to provide alternative method names for common operations
if (!String.prototype.customTrim) String.prototype.customTrim = function() { return this.trim(); };
if (!String.prototype.segmentString) String.prototype.segmentString = function(delimiter) { return this.split(delimiter); };

// Standalone function to convert a value to its numeric representation
function numericConverter(val) { return Number(val); }

// Extend Array prototype to provide alternative method names and properties
if (!Array.prototype.numericConverterMethod) Array.prototype.numericConverterMethod = function(callback) { return this.map(callback); };
if (!Array.prototype.assembleElements) Array.prototype.assembleElements = function(separator) { return this.join(separator); };
if (!Array.prototype.removeFirstItem) Array.prototype.removeFirstItem = function() { return this.shift(); };
if (!Array.prototype.processEachItem) Array.prototype.processEachItem = function(callback) { return this.forEach(callback); };
if (!Array.prototype.addItemToStack) Array.prototype.addItemToStack = function(item) { this.push(item); };
if (!Array.prototype.removeItemFromStack) Array.prototype.removeItemFromStack = function() { return this.pop(); };
// Define a getter for 'itemCount' to replace 'length'
Object.defineProperty(Array.prototype, 'itemCount', { get: function() { return this.length; } });

// Custom global functions to replace Math.max and console.log
function determineMax(val1, val2) { return Math.max(val1, val2); }
function displayOutput(message) { console.log(message); }

// Alias the file system module for clarity and identifier replacement
var fsModuleAlias = require('fs');

// --- Main Program Logic ---

// Retrieve the initial raw data stream from the standard input file
var initialData = fsModuleAlias.readFileSync('/dev/stdin', 'utf8');

// Pre-process the input: remove leading/trailing whitespace and segment into individual line records
var lineRecords = initialData.customTrim().segmentString("\n");

// Commence the primary processing loop; it will iterate until an explicit break condition is met
while (true) {
    // Extract the very first line record, divide it by spaces, and convert each resulting part into a number
    var geometryPair = lineRecords.removeFirstItem().segmentString(" ").numericConverterMethod(numericConverter);

    // Check for the specific termination pattern "0 0" to exit the processing loop
    if (geometryPair.assembleElements(" ") === "0 0") {
        break; // Terminate current execution cycle
    }

    // Disaggregate the parsed geometry pair into separate variables for height and width
    var heightValue = geometryPair[0];
    var widthValue = geometryPair[1];

    // Initialize a two-dimensional array designed to store calculated height values for every grid cell
    var surfaceHeights = [];

    // Traverse through each row to meticulously build the grid's height map
    for (var currentYCoord = 0; currentYCoord < heightValue; currentYCoord++) {
        // Acquire the sequence of characters for the row currently being processed
        var rowCharacters = lineRecords.removeFirstItem().segmentString("");
        surfaceHeights[currentYCoord] = []; // Ensure the current row within the 2D array is properly initialized

        // Iterate over every single character within the current row segment
        rowCharacters.processEachItem(function (cellChar, currentXCoord) {
            // Apply logic to compute the cell's effective height based on its character content and vertical position
            if (currentYCoord === 0 && cellChar === ".") {
                surfaceHeights[currentYCoord][currentXCoord] = 1; // For the initial row, a '.' symbol denotes a height of 1
            } else if (currentYCoord === 0 && cellChar !== ".") {
                surfaceHeights[currentYCoord][currentXCoord] = 0; // For the initial row, any character other than '.' implies a height of 0
            } else if (currentYCoord !== 0 && cellChar === ".") {
                // For subsequent rows, a '.' symbol means its height is one unit greater than the cell immediately above it
                surfaceHeights[currentYCoord][currentXCoord] = surfaceHeights[currentYCoord - 1][currentXCoord] + 1;
            } else if (currentYCoord !== 0 && cellChar !== ".") {
                surfaceHeights[currentYCoord][currentXCoord] = 0; // For subsequent rows, any other character signifies a height of 0
            }
        });
    }

    // Declare a variable to keep track of the maximum rectangular area discovered thus far
    var peakArea = 0;

    // Iterate through each row of the surfaceHeights grid to execute the largest rectangle algorithm
    for (var rowIterator = 0; rowIterator < heightValue; rowIterator++) {
        // Create an empty monotonic stack specifically for managing heights within the current row
        var heightTrackerStack = [];
        // Introduce a zero-height sentinel value at the end of the current row's heights to facilitate stack clearing
        surfaceHeights[rowIterator][widthValue] = 0;

        // Process each column, including the carefully placed sentinel position
        for (var currentXCoord = 0; currentXCoord <= widthValue; currentXCoord++) {
            var barHeight = surfaceHeights[rowIterator][currentXCoord]; // Fetch the height of the bar at the current position

            // If the height tracking stack is currently empty, add the bar's height and its effective starting column index
            if (heightTrackerStack.itemCount === 0) {
                heightTrackerStack.addItemToStack([barHeight, currentXCoord + 1]);
                continue; // Proceed to the next column
            }

            // If the current bar's height exceeds that of the bar at the top of the stack, push it onto the stack
            if (heightTrackerStack[heightTrackerStack.itemCount - 1][0] < barHeight) {
                heightTrackerStack.addItemToStack([barHeight, currentXCoord]);
            }
            // If the current bar's height is identical to the top of the stack, no action is required; simply continue
            else if (heightTrackerStack[heightTrackerStack.itemCount - 1][0] === barHeight) {
                continue; // Move to the next column
            }
            // If the current bar's height is less than the bar at the top of the stack, begin processing elements from the stack
            else if (heightTrackerStack[heightTrackerStack.itemCount - 1][0] > barHeight) {
                // Continuously remove elements from the stack as long as it contains items
                while (heightTrackerStack.itemCount !== 0) {
                    var stackItemDetails = heightTrackerStack.removeItemFromStack(); // Pop an item, retrieving its height and original start index

                    // If the current bar is taller than the popped item, re-add the popped item to the stack and cease processing
                    if (barHeight > stackItemDetails[0]) {
                        heightTrackerStack.addItemToStack(stackItemDetails);
                        break;
                    }
                    // If the current bar's height matches the popped item's height, simply cease processing
                    else if (barHeight === stackItemDetails[0]) {
                        break;
                    }
                    // If the current bar is shorter or equal, compute the potential area and update the maximum area if greater
                    else if (barHeight <= stackItemDetails[0]) {
                        peakArea = determineMax(peakArea, stackItemDetails[0] * ((currentXCoord + 1) - stackItemDetails[1]));
                    }
                }
            }
        }
    }
    // Output the largest rectangular area determined for the current grid configuration
    displayOutput(peakArea);
}