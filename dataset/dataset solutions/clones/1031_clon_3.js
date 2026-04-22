const ioSettings = {
    sourcePath: '/dev/stdin', // Defines the input source for the terrain data
    lineDelimiter: '\n'       // Specifies the character used to separate lines in the input
};

// Reads the entire content of the specified input file, decodes it as UTF-8,
// and then splits it into an array of strings based on the line delimiter.
// We are primarily interested in the first line for our terrain analysis.
const rawInputLines = require('fs').readFileSync(ioSettings.sourcePath, 'utf-8').split(ioSettings.lineDelimiter);

// Initializes the state object that will be used by the Array.prototype.reduce method.
// 'basinDepths' will store pairs of [start_index, total_volume] for each identified water basin.
// 'leftBoundaryMarkers' acts as a stack to keep track of the indices of encountered backslash characters ('\'),
// which represent the left walls of potential water-trapping depressions.
const initialProcessingState = {
    basinDepths: [],         // An array to hold information about each water basin found.
    leftBoundaryMarkers: []  // A stack for indices of '\' characters.
};

// Iterates through each character of the first line of the input to calculate water volumes.
// The reduce method processes the terrain string, updating the accumulator with basin information.
const processedTerrainResults = rawInputLines[0].split('').reduce((currentAccumulator, terrainSymbol, currentIndex) => {
    // If the current character is a backslash, it indicates a potential left boundary of a basin.
    // Its index is pushed onto the stack of left boundary markers.
    if (terrainSymbol === '\\') {
        currentAccumulator.leftBoundaryMarkers.push(currentIndex);
    }
    // If the current character is a forward slash AND there are available left boundary markers on the stack,
    // this signifies the closure of a water basin or an extension of an existing one.
    else if (terrainSymbol === '/' && currentAccumulator.leftBoundaryMarkers.length > 0) {
        // Pop the index of the most recently encountered left boundary marker.
        const lastLeftBoundaryIndex = currentAccumulator.leftBoundaryMarkers.pop();

        // Calculate the direct horizontal distance (and thus direct volume) between the
        // left boundary and the current forward slash (right boundary).
        const immediateSegmentVolume = currentIndex - lastLeftBoundaryIndex;

        // Initialize variables to sum up volumes of any basins nested within the current one
        // and to build a new, updated collection of basins.
        let totalNestedBasinVolume = 0;
        const newBasinCollection = [];

        // Iterate through the existing basinDepths to identify and merge nested basins.
        for (const existingBasin of currentAccumulator.basinDepths) {
            // If an existing basin's start index is greater than or equal to the
            // lastLeftBoundaryIndex, it means this basin is nested within the current
            // newly formed or expanded basin. Its volume is added to the nested total.
            if (existingBasin[0] >= lastLeftBoundaryIndex) {
                totalNestedBasinVolume += existingBasin[1]; // Add its volume to the sum.
            } else {
                // Basins that are not nested within the current one are carried over
                // to the new collection without modification.
                newBasinCollection.push(existingBasin);
            }
        }

        // Calculate the total volume for the current basin. This includes the direct
        // volume between its walls plus the sum of volumes of any basins contained within it.
        const currentBasinCalculatedVolume = immediateSegmentVolume + totalNestedBasinVolume;

        // Add the newly calculated or expanded basin (its starting index and total volume)
        // to the updated collection of basins.
        newBasinCollection.push([lastLeftBoundaryIndex, currentBasinCalculatedVolume]);

        // Replace the accumulator's basin collection with the newly formed one.
        currentAccumulator.basinDepths = newBasinCollection;
    }

    // Return the modified accumulator for the next iteration of the reduce function.
    return currentAccumulator;
}, initialProcessingState); // The initial state for the reduction process.

// After processing all characters, calculate the grand total of all trapped water volume.
// This is done by summing the volumes of all individual basins identified in the final collection.
const overallTrappedVolume = processedTerrainResults.basinDepths.reduce((totalAccumulatedVolume, basinEntry) => {
    return totalAccumulatedVolume + basinEntry[1];
}, 0);

// Determine the total number of distinct water basins found in the terrain.
const distinctBasinCount = processedTerrainResults.basinDepths.length;

// Output the overall total volume of trapped water.
console.log(overallTrappedVolume);

// Construct and output a string representing the count of basins and their individual volumes.
// If no basins are found, it simply prints the count (0).
// If basins exist, it prints the count followed by a space-separated list of each basin's volume.
let individualVolumesFormattedOutput = `${distinctBasinCount}`;
if (distinctBasinCount > 0) {
    individualVolumesFormattedOutput += ' ' + processedTerrainResults.basinDepths
                                                 .map(basinDetails => basinDetails[1].toString()) // Extract and convert volumes to strings
                                                 .join(' ');                                    // Join them with spaces
}
console.log(individualVolumesFormattedOutput);