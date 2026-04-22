const fileSystem = require('fs'); // Import the file system module
const standardInputPath = '/dev/stdin'; // Define the path for standard input

/**
 * Reads raw input from a specified path, processes it, and calculates a specific metric.
 * This function handles input parsing, frequency counting, and result determination.
 */
function processInputAndCalculateMetric() {
    let rawInputContent;
    try {
        rawInputContent = fileSystem.readFileSync(standardInputPath, 'utf8');
    } catch (errorReadingFile) {
        // Log an error or handle cases where input cannot be read
        // For competitive programming, often just exit or default to 0
        console.error("Error reading input:", errorReadingFile.message);
        console.log(0); // Default output if input cannot be processed
        return;
    }

    // Clean and split the input into individual lines
    const inputLines = rawInputContent.trim().split('\n');

    // If there's no meaningful input, output 0 and exit
    if (inputLines.length === 0 || inputLines[0].trim() === '') {
        console.log(0);
        return;
    }

    // Extract the total number of range definitions from the first line
    const totalRangeDefinitions = parseInt(inputLines.shift(), 10);

    // Validate the parsed number of ranges
    if (isNaN(totalRangeDefinitions) || totalRangeDefinitions < 0) {
        console.log(0); // Invalid number of ranges, output 0
        return;
    }

    // A Map is used to store the frequency of each number.
    // It's more efficient for sparse data than a large array or plain object
    // if many numbers in the 2-100001 range are never encountered.
    const numberFrequencies = new Map();

    // Define the maximum number we are interested in tracking.
    // This value is crucial for the problem's constraints.
    const MAXIMUM_CONSIDERED_NUMBER = 100001;

    // Iterate through each range definition provided in the input
    for (let currentDefinitionIndex = 0; currentDefinitionIndex < totalRangeDefinitions; ++currentDefinitionIndex) {
        const lineWithRange = inputLines.shift(); // Get the next line containing a range

        // Skip if the line is empty or undefined (e.g., fewer lines than totalRangeDefinitions)
        if (!lineWithRange) {
            continue;
        }

        // Parse the start and end values of the current range
        const rangeBoundaryStrings = lineWithRange.split(' ');
        const parsedBoundaries = rangeBoundaryStrings.map(Number);

        // Validate that we have two valid numbers for the range
        if (parsedBoundaries.length !== 2 || isNaN(parsedBoundaries[0]) || isNaN(parsedBoundaries[1])) {
            continue; // Skip invalid range definitions
        }

        // Ensure the start value is always less than or equal to the end value
        // This handles cases where input might be "5 2" instead of "2 5"
        const rangeStart = Math.min(parsedBoundaries[0], parsedBoundaries[1]);
        const rangeEnd = Math.max(parsedBoundaries[0], parsedBoundaries[1]);

        // Increment the frequency for each number within the current range
        for (let numIterator = rangeStart; numIterator <= rangeEnd; ++numIterator) {
            // Only track numbers within our defined bounds [2, MAXIMUM_CONSIDERED_NUMBER]
            if (numIterator >= 2 && numIterator <= MAXIMUM_CONSIDERED_NUMBER) {
                // Get current count, or 0 if not present, then increment and update
                numberFrequencies.set(numIterator, (numberFrequencies.get(numIterator) || 0) + 1);
            }
        }
    }

    // Initialize the variable to store the highest valid count found.
    // It starts at 1 because the final output is `max - 1`, so a 0-based result implies 1 here.
    let highestAchievedCount = 1;

    // Iterate from 2 up to the maximum considered number to find the optimal count
    for (let candidateValue = 2; candidateValue <= MAXIMUM_CONSIDERED_NUMBER; ++candidateValue) {
        // Retrieve the frequency for the current candidate number.
        // If the number was never in any range, its frequency is 0.
        const currentFrequency = numberFrequencies.get(candidateValue) || 0;

        // Apply the core condition: the frequency must be at least the candidate number itself.
        if (currentFrequency >= candidateValue) {
            // If this frequency is greater than our current highest, update it.
            if (currentFrequency > highestAchievedCount) {
                highestAchievedCount = currentFrequency;
            }
        }
    }

    // The problem requires outputting the result minus one.
    console.log(highestAchievedCount - 1);
}

// Execute the main processing function
processInputAndCalculateMetric();