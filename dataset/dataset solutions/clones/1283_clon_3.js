const BUILDING_DIMENSION_ONE = 4;
const BUILDING_DIMENSION_TWO = 3;
const BUILDING_DIMENSION_THREE = 10;
const INDEX_OFFSET_ADJUSTMENT = 1; // Used to convert 1-based input to 0-based array indices
const OUTPUT_BLOCK_DELIMITER = "===================="; // Changed separator string
const DATA_SOURCE_PATH = '/dev/stdin';

/**
 * Creates a new array filled with a specified value.
 * @param {number} size - The desired size of the array.
 * @param {*} fillValue - The value to fill the array with.
 * @returns {Array} A new array of the given size, filled with fillValue.
 */
const createFilledArray = (size, fillValue) => {
    return Array.from({ length: size }, () => fillValue);
};

// Initialize the primary data structure, representing a multi-dimensional grid.
// This structure will hold numerical counts for different locations.
let buildingRegistry = []; // Renamed from 'mune'
for (let bldgIdx = 0; bldgIdx < BUILDING_DIMENSION_ONE; bldgIdx++) {
    let floorArrangement = []; // Renamed from 'kai'
    for (let flrIdx = 0; flrIdx < BUILDING_DIMENSION_TWO; flrIdx++) {
        // Each 'room' row is initialized to all zeros.
        floorArrangement[flrIdx] = createFilledArray(BUILDING_DIMENSION_THREE, 0);
    }
    buildingRegistry[bldgIdx] = floorArrangement;
}

/**
 * Safely reads the content of a file.
 * @param {string} filePath - The path to the file.
 * @returns {string} The file content as a UTF-8 string, or an empty string on error.
 */
const retrieveDataFromFile = (filePath) => {
    try {
        // Using Node.js 'fs' module to read the file synchronously.
        return require('fs').readFileSync(filePath, 'utf8');
    } catch (error) {
        // Log the error but continue execution, treating it as empty input.
        console.error(`Error encountered while reading file '${filePath}': ${error.message}`);
        return '';
    }
};

// --- Data Input and Processing Section ---

// Read the raw input content from the specified source.
const rawInputBuffer = retrieveDataFromFile(DATA_SOURCE_PATH);
const fileContentLines = rawInputBuffer.split("\n");

// Helper for coordinate validation
const isWithinBounds = (value, max) => value >= 0 && value < max;

// Process each line of the input, skipping the first (often a header or count).
// Using forEach for a different iteration style.
fileContentLines.forEach((currentLine, lineIndex) => {
    // Skip the first line, which is typically a count or metadata.
    if (lineIndex === 0) {
        return; // Continue to the next line
    }

    const trimmedLine = currentLine.trim();
    // Skip empty lines or lines with only whitespace.
    if (trimmedLine.length === 0) {
        return;
    }

    // Parse the numeric components from the current line.
    const numericComponents = trimmedLine.split(" ").map(Number);

    // Validate that we have enough numeric components and that they are indeed numbers.
    if (numericComponents.length < 4 || numericComponents.some(isNaN)) {
        // console.warn(`Skipping malformed input line #${lineIndex + 1}: '${trimmedLine}'`);
        return;
    }

    // Extract and adjust the indices and the value to be added.
    const targetBuildingIndex = numericComponents[0] - INDEX_OFFSET_ADJUSTMENT;
    const targetFloorIndex = numericComponents[1] - INDEX_OFFSET_ADJUSTMENT;
    const targetRoomIndex = numericComponents[2] - INDEX_OFFSET_ADJUSTMENT;
    const incrementValue = numericComponents[3];

    // Perform boundary checks before attempting to update the data structure.
    const validBuilding = isWithinBounds(targetBuildingIndex, BUILDING_DIMENSION_ONE);
    const validFloor = isWithinBounds(targetFloorIndex, BUILDING_DIMENSION_TWO);
    const validRoom = isWithinBounds(targetRoomIndex, BUILDING_DIMENSION_THREE);

    if (validBuilding && validFloor && validRoom) {
        // Safely update the value in the 3D structure.
        buildingRegistry[targetBuildingIndex][targetFloorIndex][targetRoomIndex] += incrementValue;
    } else {
        // console.warn(`Coordinates out of bounds for line #${lineIndex + 1}: B:${numericComponents[0]}, F:${numericComponents[1]}, R:${numericComponents[2]}`);
    }
});

// --- Data Output Section ---

// Check if the registry is empty before attempting to print.
if (buildingRegistry.length === 0) {
    // console.log("The building registry is empty. No data to display.");
    // This is a Type III addition: a guard clause for an empty structure.
} else {
    // Iterate through the processed data structure and print results.
    buildingRegistry.forEach((currentBuildingLevels, buildingIdentifier) => {
        // Print a separator *before* each building's data, except for the very first one.
        if (buildingIdentifier > 0) {
            console.log(OUTPUT_BLOCK_DELIMITER);
        }

        currentBuildingLevels.forEach((roomRowData, floorIdentifier) => {
            // Join the numbers in the current row with spaces for display.
            const formattedRoomDisplay = roomRowData.join(" ");
            console.log(formattedRoomDisplay);
        });
    });
}