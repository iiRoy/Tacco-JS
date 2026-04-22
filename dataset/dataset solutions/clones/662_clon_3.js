const fileSystem = require('fs');

/**
 * Parses a line containing two space-separated numeric values into an array of numbers.
 * Includes basic validation for the expected format.
 * @param {string} inputLine - The string line to parse, e.g., "10 5".
 * @returns {number[]} An array containing two numeric values [value1, value2].
 */
const extractNumericPair = (inputLine) => {
    const segments = inputLine.trim().split(' ');
    // Ensure that exactly two segments were found.
    if (segments.length !== 2) {
        console.error('Parsing Error: Expected exactly two numbers, received:', inputLine);
        // Return default values to prevent further errors, or throw an exception.
        return [0, 0];
    }
    return segments.map(Number);
};

/**
 * Generates a collection of 3D coordinate strings that are to be considered "blocked"
 * based on a specified restriction rule.
 * @param {string} restrictionType - The identifier for the restriction plane ("xy", "xz", "yz").
 * @param {number} fixedCoordinateA - The first fixed coordinate value.
 * @param {number} fixedCoordinateB - The second fixed coordinate value.
 * @param {number} maximumDimension - The maximum extent for the varying coordinate (N).
 * @returns {string[]} An array of coordinate strings in the format "x,y,z".
 */
const computeBlockedCubeCoordinates = (restrictionType, fixedCoordinateA, fixedCoordinateB, maximumDimension) => {
    const coordinatesToMark = [];
    // Iterate through the varying dimension from 1 up to the maximumDimension.
    for (let currentDynamicCoord = 1; currentDynamicCoord <= maximumDimension; currentDynamicCoord++) {
        let coordX, coordY, coordZ;

        // Determine the x, y, z components based on the restriction type.
        switch (restrictionType) {
            case "xy": // Plane where X=fixedCoordinateA, Y=fixedCoordinateB, Z varies
                coordX = fixedCoordinateA;
                coordY = fixedCoordinateB;
                coordZ = currentDynamicCoord;
                break;
            case "xz": // Plane where X=fixedCoordinateA, Y varies, Z=fixedCoordinateB
                coordX = fixedCoordinateA;
                coordY = currentDynamicCoord;
                coordZ = fixedCoordinateB;
                break;
            case "yz": // Plane where X varies, Y=fixedCoordinateA, Z=fixedCoordinateB
                coordX = currentDynamicCoord;
                coordY = fixedCoordinateA;
                coordZ = fixedCoordinateB;
                break;
            default:
                // If an unrecognized restriction type is encountered, log a warning and skip.
                console.warn(`Unrecognized restriction type encountered: '${restrictionType}'. Skipping this rule.`);
                continue;
        }
        // Add the generated coordinate string to the list.
        coordinatesToMark.push(`${coordX},${coordY},${coordZ}`);
    }
    return coordinatesToMark;
};

// Read the complete input stream from standard input, interpreting it as UTF-8 text.
const rawInputStream = fileSystem.readFileSync('/dev/stdin', 'utf8');

// Process the raw input: trim leading/trailing whitespace and split into individual lines.
let bufferedInputLines = rawInputStream.trim().split('\n');

// Begin the primary processing loop, handling multiple test cases sequentially.
// The loop continues indefinitely until a specific termination condition is met.
while (true) {
    // Extract the first line from the buffer, which should contain the N and H values.
    const configurationLine = bufferedInputLines.shift();

    // Check for the termination signal ("0 0") or if the input buffer is unexpectedly empty.
    if (configurationLine === undefined || configurationLine === '0 0') {
        break; // Exit the loop as the end of input or termination signal is reached.
    }

    // Parse the N (cube dimension) and H (number of restrictions) from the configuration line.
    const [cubeSideLength, numberOfRestrictionRules] = extractNumericPair(configurationLine);

    // If parsing resulted in invalid dimensions (e.g., [0,0] from an error, not '0 0' signal),
    // log an error and skip to the next input block.
    if (cubeSideLength === 0 && numberOfRestrictionRules === 0 && configurationLine !== '0 0') {
        console.error('Skipping block due to invalid configuration:', configurationLine);
        continue;
    }

    // Initialize a Set to store all unique 3D coordinates that are marked as blocked.
    // A Set is used to efficiently handle uniqueness and avoid duplicate entries.
    const blockedCubesRegistry = new Set();

    // Iterate through each restriction rule line for the current test case.
    for (let ruleIndex = 0; ruleIndex < numberOfRestrictionRules; ruleIndex++) {
        // Extract and parse the current restriction rule line.
        const ruleComponents = bufferedInputLines.shift().trim().split(' ');

        // Basic validation: A rule line must consist of exactly three components.
        if (ruleComponents.length !== 3) {
            console.error('Error: Malformed restriction rule line. Expected 3 components:', ruleComponents.join(' '));
            continue; // Skip this malformed rule and proceed to the next.
        }

        const rulePlaneIdentifier = ruleComponents[0];
        // Convert the string coordinate values to numbers.
        const firstFixedCoordValue = Number(ruleComponents[1]);
        const secondFixedCoordValue = Number(ruleComponents[2]);

        // Generate the specific 3D coordinates that are blocked by this rule.
        const newlyAddedBlockedCoordinates = computeBlockedCubeCoordinates(
            rulePlaneIdentifier,
            firstFixedCoordValue,
            secondFixedCoordValue,
            cubeSideLength
        );

        // Add all newly identified blocked coordinates to the central registry.
        newlyAddedBlockedCoordinates.forEach(coordKey => blockedCubesRegistry.add(coordKey));
    }

    // Calculate the total theoretical number of cubes in an N x N x N grid.
    const totalPossibleCubesVolume = cubeSideLength * cubeSideLength * cubeSideLength;

    // The number of uniquely blocked cubes is simply the size of the Set.
    const countOfBlockedCubes = blockedCubesRegistry.size;

    // Determine the number of unblocked cubes by subtracting the blocked count from the total volume.
    const numberOfUnobstructedCubes = totalPossibleCubesVolume - countOfBlockedCubes;

    // Output the final result for the current test case to standard output.
    console.log(numberOfUnobstructedCubes);
}

// Script execution concludes.