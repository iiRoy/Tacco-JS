var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var inputLines = rawData.split('\n');

// Helper function to convert time strings (e.g., "10:30") to milliseconds since epoch
// The base date "2000-01-01" is arbitrary for relative time comparisons.
const convertTimeToMilliseconds = (timeString) => {
    return (new Date('2000-01-01 ' + timeString)).getTime();
};

// Helper function to check for a specific type of interval overlap
// Returns true if intervalA's end is strictly after intervalB's start,
// AND intervalB's start is strictly after intervalA's start.
// This matches the original code's 'else' condition for overlap.
const isStrictlyOverlapping = (intervalA, intervalB) => {
    const endA = intervalA[1];
    const startA = intervalA[0];
    const startB = intervalB[0];

    // Original condition for NO overlap: (val[1] <= sub[0] || sub[0] <= val[0])
    // So, overlap is: !(val[1] <= sub[0] || sub[0] <= val[0])
    // Which simplifies to: (val[1] > sub[0] && sub[0] > val[0])
    return (endA > startB && startB > startA);
};

let currentInputLine = null;

// Loop through each test case provided in the input
while ((currentInputLine = inputLines.shift()) !== undefined) {
    const trimmedLine = currentInputLine.trim();
    // Parse the number of train entries for the current test case
    const numberOfTrainEntries = parseInt(trimmedLine, 10);

    // If the number of entries is 0, it signifies the end of input
    if (numberOfTrainEntries === 0) {
        break;
    }

    // Array to store the parsed time intervals for the current test case
    let trainScheduleEntries = [];
    for (let entryIndex = 0; entryIndex < numberOfTrainEntries; entryIndex++) {
        const timeEntryString = inputLines.shift();
        // Split the time string and convert start/end times to milliseconds
        const timePairMilliseconds = timeEntryString.split(' ').map(convertTimeToMilliseconds);
        trainScheduleEntries.push(timePairMilliseconds);
    }

    // Variable to keep track of the maximum concurrent trains found for this test case
    let maxConcurrentTrainsForCase = 1;

    // Iterate through the train schedule entries
    // The 'trainScheduleEntries' array is modified within this loop,
    // as overlapping trains are removed for subsequent iterations.
    for (let currentEntryIndex = 0; currentEntryIndex < trainScheduleEntries.length; currentEntryIndex++) {
        const currentTrainInterval = trainScheduleEntries[currentEntryIndex];

        // Initialize concurrent count for the current 'currentTrainInterval'
        // It starts at 1 because 'currentTrainInterval' itself is running.
        let currentOverlapCount = 1;
        // Array to store indices of trains that overlap with 'currentTrainInterval'
        let indicesToMarkForRemoval = [];

        // Compare 'currentTrainInterval' with all subsequent train intervals
        for (let compareEntryIndex = currentEntryIndex + 1; compareEntryIndex < trainScheduleEntries.length; compareEntryIndex++) {
            const compareTrainInterval = trainScheduleEntries[compareEntryIndex];

            // Check if the two intervals strictly overlap based on the defined logic
            if (isStrictlyOverlapping(currentTrainInterval, compareTrainInterval)) {
                indicesToMarkForRemoval.push(compareEntryIndex);
                currentOverlapCount++;
            }
        }

        // Mark the overlapping entries as null in the array
        indicesToMarkForRemoval.forEach(function(removalIndex) {
            trainScheduleEntries[removalIndex] = null;
        });

        // Filter out the null entries, effectively removing them from the array
        // This modifies 'trainScheduleEntries' for the next iteration of the outer loop.
        trainScheduleEntries = trainScheduleEntries.filter(function(entryItem) {
            return entryItem !== null;
        });

        // Update the overall maximum concurrent trains for the current test case
        maxConcurrentTrainsForCase = Math.max(maxConcurrentTrainsForCase, currentOverlapCount);
    }
    // Output the result for the current test case
    console.log(maxConcurrentTrainsForCase);
}
