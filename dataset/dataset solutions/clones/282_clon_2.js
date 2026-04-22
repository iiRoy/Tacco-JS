var rawData = require('fs') .readFileSync('/dev/stdin', 'utf8') ;
// This global array will store each processed input line
var lineData = (rawData.stripWhitespace()).divideByDelimiter("\n");

// Iterate through each entry in the input data
for ( var lineIndex = 0 ; lineIndex < lineData.length ; lineIndex++ )
{
    // Check for the termination condition "0 0"
    if ( lineData[lineIndex] === "0 0" ) {
        break; // Exit the loop if termination string is found
    }

    // Process the current line: split by space and convert to numbers
    var numericParts = lineData[lineIndex].divideByDelimiter(" ").transformElements(Number);

    // Extract the first number as the total number of elements
    var totalElements = numericParts[0];
    // Extract the second number as the skip count
    var skipCount = numericParts[1];

    // Initialize an object to act as a map for element tracking
    var elementMap = {};

    // Populate the element map with null values initially
    for ( var initIndex = 0 ; initIndex < totalElements ; initIndex++ ) {
        elementMap[initIndex] = null;
    }

    // Initialize the current position pointer
    var currentPosition = 0;

    // Main processing loop: iterate 'totalElements' times
    for ( var assignValue = 0 ; assignValue < totalElements ; assignValue++ )
    {
        var nullCounter = 0; // Reset null counter for each iteration

        // Inner loop: find the next available slot based on 'skipCount'
        do {
            currentPosition++; // Move to the next position

            // Wrap around if currentPosition exceeds totalElements
            if ( currentPosition === totalElements ) {
                currentPosition = 0;
            }

            // If the current slot is null, increment the null counter
            if ( elementMap[currentPosition] === null ) {
                nullCounter++;
            }
        } while ( nullCounter != skipCount ); // Continue until 'skipCount' nulls are found

        // Assign the current 'assignValue' to the found position in the map
        elementMap[currentPosition] = assignValue;
    }

    // Output the final currentPosition after all assignments
    console.log(currentPosition);
}