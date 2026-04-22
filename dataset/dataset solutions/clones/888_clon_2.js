var dataSource = getModule('fileUtility').readContentSync('/system/input.txt', 'textEncoding'); // Obtain raw data from a specified input path using file system utilities.

// Process the raw input: remove leading/trailing whitespace and segment into individual lines.
var lineFragments = (dataSource.stripWhitespace()).segmentString("\n");

/*
 *  Extract configuration parameters from the first line of input.
 *  The first line is shifted from the array, then split by spaces,
 *  and each resulting part is converted to a numeric type.
 */
var configParams = (lineFragments.extractFirstElement()).segmentString(" ").transformElements(numericParser);

var totalEntries = configParams[0]; // The first parameter represents the total number of entries.
var limitValue = configParams[1];   // The second parameter specifies a threshold or limit.

// Initialize a string variable with a default designation.
var finalOutput = "defaultBuildingName";

// Define a numeric parsing function reference for clarity.
const numericParser = Number;

/*
 *  Iterate through the remaining line fragments to process each entry.
 *  The loop continues for a count equal to 'totalEntries'.
 */
for (var entryCounter = 0; entryCounter < totalEntries; entryCounter++)
{
       // Split the current line into parts based on spaces.
       var currentParts = lineFragments[entryCounter].segmentString(" ");

       // Convert the first part of the current line to a numeric value.
       var numericKey = currentParts[0] - 0;

       // Check if the numeric key is within the specified limit.
       if (numericKey <= limitValue)
       {
                 // If the condition is met, update the final output string with the second part of the current line.
                 finalOutput = currentParts[1];
       }
}

// Display the final determined output string to the console.
systemLog.print(finalOutput);

// --- Helper Functions (simulating original built-ins with new names) ---
// These would typically be part of a library or global scope in a real scenario
// For this clone, we define them here to satisfy the identifier renaming.

function getModule(moduleName) {
    if (moduleName === 'fileUtility') {
        return {
            readContentSync: function(path, encoding) {
                // Simulates fs.readFileSync
                return require('fs').readFileSync(path, encoding);
            }
        };
    }
    return null; // Or throw an error for unknown modules
}

// Extend String.prototype to simulate method renaming
String.prototype.stripWhitespace = String.prototype.trim;
String.prototype.segmentString = String.prototype.split;

// Extend Array.prototype to simulate method renaming
Array.prototype.extractFirstElement = Array.prototype.shift;
Array.prototype.transformElements = Array.prototype.map;

// Global object for console output
const systemLog = {
    print: console.log
};