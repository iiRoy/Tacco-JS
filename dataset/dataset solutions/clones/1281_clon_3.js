process.stdin.resume();

// Define character encoding for incoming data streams
const INPUT_CHARSET_ENCODING = 'utf-8';
// Define a constant for the visual separator used in the output report
const REPORT_BLOCK_SEPARATOR = '####################';

// Buffer to accumulate all raw input received from standard input
let accumulatedRawInputBuffer = '';

// Configure the standard input stream to use the specified encoding
process.stdin.setEncoding(INPUT_CHARSET_ENCODING);

// Attach an event listener to capture data chunks as they arrive
process.stdin.on('data', (incomingDataChunk) => {
    // Append each received data chunk to the accumulation buffer
    accumulatedRawInputBuffer += incomingDataChunk;
});

// Attach an event listener for when the standard input stream ends
process.stdin.on('end', () => {
    // Perform a trim operation to remove any leading/trailing whitespace
    // and check if the buffer is empty after processing
    if (!accumulatedRawInputBuffer.trim()) {
        console.error('Error: No input data was provided for processing. Terminating execution.');
        return; // Exit the program if no meaningful input is present
    }

    // Split the accumulated raw input into individual lines
    const processedInputLinesArray = accumulatedRawInputBuffer.trim().split('\n');

    // Invoke the primary function to analyze and report on the building occupancy
    initiateBuildingOccupancyAnalysis(processedInputLinesArray);
});

/**
 * Helper function to parse a string line into an array of integers.
 * Includes basic validation for parsing.
 * @param {string} currentStringLine The string line to be parsed.
 * @returns {number[]} An array of integers parsed from the line.
 */
function extractNumericValuesFromLine(currentStringLine) {
    // Split the line by spaces, filter out any empty strings resulting from multiple spaces,
    // and then parse each token into an integer.
    return currentStringLine.split(' ').filter(token => token.length > 0).map(numericToken => {
        const parsedInteger = parseInt(numericToken, 10); // Use radix 10 for explicit decimal parsing
        if (isNaN(parsedInteger)) {
            // Log a warning if a token cannot be parsed into a number
            console.warn(`Warning: Encountered non-numeric data "${numericToken}". Defaulting to 0.`);
            return 0; // Return 0 or handle as an error based on requirements
        }
        return parsedInteger;
    });
}

/**
 * Helper function to format an array of occupancy counts into a space-separated string.
 * @param {number[]} floorOccupancyDataArray An array representing room occupancy counts for a floor.
 * @returns {string} A string with space-separated occupancy counts.
 */
function createFormattedFloorOutputString(floorOccupancyDataArray) {
    // Convert each number to a string and then join them with a single space.
    return floorOccupancyDataArray.map(countValue => String(countValue)).join(' ');
}

/**
 * Main function responsible for processing building occupancy data
 * and generating a formatted report.
 * @param {string[]} allInputDataRows An array of strings where the first element
 *                                    specifies the count of subsequent data entries.
 */
const initiateBuildingOccupancyAnalysis = (allInputDataRows) => {
    // Create a mutable copy of the input array to safely use array modification methods like shift().
    let mutableInputDataCopy = [...allInputDataRows];

    // Extract and parse the first line, which indicates the number of data entries to follow.
    const firstDataLine = mutableInputDataCopy.shift();
    const countOfDataEntries = parseInt(firstDataLine, 10);

    // Validate the parsed count of data entries.
    if (isNaN(countOfDataEntries) || countOfDataEntries < 0) {
        console.error('Error: The specified number of data entries is invalid. Please check input format.');
        return;
    }

    // Extract only the relevant data entries based on the parsed count.
    const buildingChangeRecords = mutableInputDataCopy.slice(0, countOfDataEntries);

    // Define the fixed dimensions of the building complex for clarity and easy modification.
    const TOTAL_BUILDING_BLOCKS = 4;
    const FLOORS_PER_BLOCK = 3;
    const ROOMS_PER_FLOOR = 10;

    // Initialize a 3D array to represent the building structure (Blocks x Floors x Rooms).
    // All rooms are initially set to an occupancy of 0.
    const buildingCensusStructure = Array.from({ length: TOTAL_BUILDING_BLOCKS }, () =>
        Array.from({ length: FLOORS_PER_BLOCK }, () =>
            Array.from({ length: ROOMS_PER_FLOOR }, () => 0)
        )
    );

    // Iterate through each record of building activity to update occupancy counts.
    buildingChangeRecords.forEach((currentLogEntryLine) => {
        // Parse the current log entry line into an array of numbers.
        const parsedLogEntryValues = extractNumericValuesFromLine(currentLogEntryLine);

        // Validate the structure of the parsed log entry.
        // Each entry is expected to have 4 values: block, floor, room, and occupancy change.
        if (parsedLogEntryValues.length < 4) {
            console.warn(`Skipping malformed log entry: "${currentLogEntryLine}". Expected 4 numeric values.`);
            return; // Skip this entry and proceed to the next one.
        }

        // Use array destructuring for cleaner access to log entry components.
        const [blockIdentifier, floorIdentifier, roomIdentifier, occupancyDelta] = parsedLogEntryValues;

        // Adjust identifiers from 1-based (as per problem statement) to 0-based array indices.
        const targetBlockIndex = blockIdentifier - 1;
        const targetFloorIndex = floorIdentifier - 1;
        const targetRoomIndex = roomIdentifier - 1;

        // Perform robust boundary checks to ensure indices are within the defined building dimensions.
        if (targetBlockIndex < 0 || targetBlockIndex >= TOTAL_BUILDING_BLOCKS ||
            targetFloorIndex < 0 || targetFloorIndex >= FLOORS_PER_BLOCK ||
            targetRoomIndex < 0 || targetRoomIndex >= ROOMS_PER_FLOOR) {
            console.warn(`Log entry specifies out-of-bounds location: Block ${blockIdentifier}, Floor ${floorIdentifier}, Room ${roomIdentifier}. Skipping.`);
            return; // Skip entries that reference non-existent parts of the building.
        }

        // Update the occupancy count for the specific room.
        buildingCensusStructure[targetBlockIndex][targetFloorIndex][targetRoomIndex] += occupancyDelta;
    });

    // Generate and output the final building occupancy report.
    buildingCensusStructure.forEach((blockSpecificData, currentBlockIdx) => {
        // Iterate through each floor within the current building block.
        blockSpecificData.forEach((floorOccupancyDetails) => {
            // Use the helper function to format the floor's occupancy data into a string.
            const formattedFloorReportLine = createFormattedFloorOutputString(floorOccupancyDetails);
            console.log(formattedFloorReportLine);
        });

        // Print a visual separator line between blocks, but not after the very last block.
        if (currentBlockIdx < buildingCensusStructure.length - 1) {
            console.log(REPORT_BLOCK_SEPARATOR);
        }
    });
};