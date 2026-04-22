const obtainFileContents = (path, encoding) => require('fs').readFileSync(path, encoding);
const stripWhitespace = (text) => text.trim();
const divideByDelimiter = (text, delimiter) => text.split(delimiter);
const extractFirst = (list) => list.shift();
const transformElements = (list, mappingFunction) => list.map(mappingFunction);
const ParseNumeric = Number;
const displayResult = console.log;

const getSize = (collection) => collection.length;
const appendElement = (collection, element) => collection.push(element);
const arrangeDescending = (collection, compareFunction) => collection.sort(compareFunction);

// This script processes multiple data sets, calculating a specific span after exclusions.
// Acquire the raw data from the standard input.
var rawDataString = obtainFileContents('/dev/stdin', 'utf8');

// Clean up the raw input and break it into an array of individual lines.
var lineFragmentsCollection = stripWhitespace(rawDataString).divideByDelimiter("\n");

// The initial line specifies the count of processing cycles to perform.
var numProcessingCycles = extractFirst(lineFragmentsCollection) - 0;

// Commence the main processing loop, decrementing the cycle counter with each pass.
while (numProcessingCycles--) {
    // Retrieve the current cycle's configuration: total elements and max skips.
    var [totalElementsCount, maxSkipsAllowed] = transformElements(divideByDelimiter(extractFirst(lineFragmentsCollection), " "), ParseNumeric);

    // Obtain the list of coordinate points for the current cycle.
    var coordinatePositions = transformElements(divideByDelimiter(extractFirst(lineFragmentsCollection), " "), ParseNumeric);

    // Compute the full extent of the coordinate range.
    var totalRangeExtent = coordinatePositions[getSize(coordinatePositions) - 1] - coordinatePositions[0];

    // Prepare an array to store the distances between consecutive coordinate points.
    var segmentDistances = [];

    // Calculate and store all individual segment distances.
    for (var positionIndex = 0; positionIndex < getSize(coordinatePositions) - 1; positionIndex++) {
        appendElement(segmentDistances, coordinatePositions[positionIndex + 1] - coordinatePositions[positionIndex]);
    }

    // Sort these segment distances in descending order to easily pick the largest ones.
    arrangeDescending(segmentDistances, (valA, valB) => valB - valA);

    // Initialize an accumulator for the sum of distances that will be excluded.
    var excludedDistancesSum = 0;

    // Iterate to sum up the (maxSkipsAllowed - 1) largest segment distances.
    for (var exclusionIndex = 0; exclusionIndex < maxSkipsAllowed - 1; exclusionIndex++) {
        // If there are fewer segments than intended for exclusion, stop.
        if (exclusionIndex > getSize(segmentDistances) - 1) {
            break;
        }
        // Add the current largest segment distance to the exclusion sum.
        excludedDistancesSum += segmentDistances[exclusionIndex];
    }

    // Output the final adjusted range: total extent minus the sum of excluded distances.
    displayResult(totalRangeExtent - excludedDistancesSum);
}