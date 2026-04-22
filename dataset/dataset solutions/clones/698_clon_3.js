// This module handles file system operations for reading input.
const fileSystem = require('fs');

// Reads all input from standard input, decodes it as UTF-8,
// then trims leading/trailing whitespace and splits into an array of lines.
let inputLineBuffer = fileSystem.readFileSync('/dev/stdin', 'utf8').trim().split("\n");

/**
 * Parses the next integer from the global input buffer.
 * It removes the line from the buffer and converts it to an integer.
 * Includes basic error handling for non-numeric lines.
 * @returns {number} The parsed integer, or 0 if the line is not a valid number or buffer is empty.
 */
const extractNextInteger = () => {
    const nextTextLine = inputLineBuffer.shift();
    if (typeof nextTextLine === 'string') {
        const numericValue = parseInt(nextTextLine.trim(), 10);
        return isNaN(numericValue) ? 0 : numericValue;
    }
    return 0; // Return zero if no more lines or input is malformed.
};

/**
 * Determines the cardinal direction and distance of movement between two consecutive points.
 * This function assumes movement is strictly orthogonal (horizontal or vertical).
 * @param {Array<number>} startPoint - The coordinates of the starting point [x, y].
 * @param {Array<number>} endPoint - The coordinates of the ending point [x, y].
 * @returns {string} A string combining the direction (n, s, e, w) and the distance, e.g., "n5".
 *                   Returns an empty string if points are identical or movement is diagonal.
 */
const calculateDirectionAndDistance = (startPoint, endPoint) => {
    const [xStart, yStart] = startPoint;
    const [xEnd, yEnd] = endPoint;

    // Check for vertical movement (same X-coordinate)
    if (xStart === xEnd) {
        if (yStart > yEnd) { // Moving downwards
            return `s${yStart - yEnd}`;
        }
        if (yStart < yEnd) { // Moving upwards
            return `n${yEnd - yStart}`;
        }
    }
    // Check for horizontal movement (same Y-coordinate)
    else if (yStart === yEnd) {
        if (xStart > xEnd) { // Moving leftwards
            return `w${xStart - xEnd}`;
        }
        if (xStart < xEnd) { // Moving rightwards
            return `e${xEnd - xStart}`;
        }
    }
    // If no movement or diagonal movement, return empty string.
    return "";
};

/**
 * Defines the mappings for path character rotations.
 * Each key represents a "North-up" orientation, and its value is an object
 * mapping original lowercase directions to their uppercase rotated counterparts.
 */
const rotationTransformations = {
    // North-up (identity transform, but uppercase output)
    'NORTH': { 'n': 'N', 'e': 'E', 's': 'S', 'w': 'W' },
    // East-up (90 degrees clockwise rotation)
    'EAST': { 'n': 'E', 'e': 'S', 's': 'W', 'w': 'N' },
    // South-up (180 degrees rotation)
    'SOUTH': { 'n': 'S', 'e': 'W', 's': 'N', 'w': 'E' },
    // West-up (270 degrees clockwise rotation)
    'WEST': { 'n': 'W', 'e': 'N', 's': 'E', 'w': 'S' }
};

/**
 * Applies a specified cardinal rotation to a path string.
 * The path string consists of lowercase direction characters (n, e, s, w)
 * followed by numerical distances. This function rotates the direction part.
 * @param {string} originalPathString - The path string to be rotated.
 * @param {string} rotationCardinal - The desired "North-up" orientation for rotation (e.g., 'NORTH', 'EAST').
 * @returns {string} The new path string with directions rotated and converted to uppercase.
 */
const applyPathRotation = (originalPathString, rotationCardinal) => {
    let resultingPath = '';
    const currentRotationMap = rotationTransformations[rotationCardinal];

    // If the rotation cardinal is invalid, return the original path uppercased as a fallback.
    if (!currentRotationMap) {
        return originalPathString.toUpperCase();
    }

    for (let charIndex = 0; charIndex < originalPathString.length; ++charIndex) {
        const currentChar = originalPathString[charIndex];
        // Check if the character is a direction character.
        if (['n', 'e', 's', 'w'].includes(currentChar)) {
            resultingPath += currentRotationMap[currentChar];
        } else {
            // Append non-direction characters (like numbers) directly.
            resultingPath += currentChar;
        }
    }
    return resultingPath;
};

// Main execution loop: processes multiple sets of path comparisons.
while (true) {
    // Read the total number of path configurations to compare against the first one.
    const totalConfigurations = extractNextInteger();

    // A value of 0 indicates the end of input, terminating the program.
    if (totalConfigurations === 0) {
        break;
    }

    // This variable will store the first path encountered, normalized to a 'NORTH' orientation.
    // All subsequent paths will be compared against this canonical form.
    let canonicalFormPath = "";
    
    // Iterate through all path configurations. The loop runs 'totalConfigurations + 1' times:
    // once for the initial canonical path, and then 'totalConfigurations' times for comparisons.
    for (let currentPathIteration = 0; currentPathIteration <= totalConfigurations; ++currentPathIteration) {
        // Read the number of coordinate points defining the current path.
        const numPointsInPath = extractNextInteger();
        
        const pathPointsList = [];
        // Extract all coordinate pairs for the current path from the input buffer.
        // Each coordinate line is expected to contain two space-separated numbers.
        for (let pointIdx = 0; pointIdx < numPointsInPath; ++pointIdx) {
            const coordinateLine = inputLineBuffer.shift();
            if (coordinateLine) {
                const parsedCoords = coordinateLine.split(" ").map(Number);
                // Basic validation: ensure we got two numbers.
                if (parsedCoords.length === 2 && !isNaN(parsedCoords[0]) && !isNaN(parsedCoords[1])) {
                    pathPointsList.push(parsedCoords);
                } else {
                    // If a line is malformed, push it as is or handle error.
                    // For cloning, closely mimic original behavior which might silently fail or produce NaNs.
                    pathPointsList.push(parsedCoords);
                }
            } else {
                // If input runs out prematurely, stop reading points for this path.
                break;
            }
        }

        // Generate the sequence of segments (direction + distance) for the current path.
        const pathSegmentsSequence = [];
        // A path must have at least two points to form any segments.
        if (pathPointsList.length >= 2) {
            for (let segmentIdx = 1; segmentIdx < pathPointsList.length; ++segmentIdx) {
                const previousCoord = pathPointsList[segmentIdx - 1];
                const currentCoord = pathPointsList[segmentIdx];
                const segmentDescription = calculateDirectionAndDistance(previousCoord, currentCoord);
                if (segmentDescription) { // Only add valid, non-empty segments.
                    pathSegmentsSequence.push(segmentDescription);
                }
            }
        }
        
        // Combine all segments into a single string for the forward path.
        const combinedForwardPath = pathSegmentsSequence.join("");
        // Create a reversed version of the path segments. Using .slice() to avoid mutating the original array.
        const combinedReversePath = pathSegmentsSequence.slice().reverse().join("");

        // The very first path processed (iteration 0) serves as the canonical reference.
        // It's normalized to a 'NORTH' orientation.
        if (currentPathIteration === 0) {
            canonicalFormPath = applyPathRotation(combinedForwardPath, 'NORTH');
        } else {
            // For all subsequent paths, generate all 8 possible orientations (4 rotations * 2 directions)
            // and compare them against the canonical reference path.

            // Rotations for the forward path
            const forwardRotatedNorth = applyPathRotation(combinedForwardPath, 'NORTH');
            const forwardRotatedEast = applyPathRotation(combinedForwardPath, 'EAST');
            const forwardRotatedSouth = applyPathRotation(combinedForwardPath, 'SOUTH');
            const forwardRotatedWest = applyPathRotation(combinedForwardPath, 'WEST');

            // Rotations for the reversed path
            const reverseRotatedNorth = applyPathRotation(combinedReversePath, 'NORTH');
            const reverseRotatedEast = applyPathRotation(combinedReversePath, 'EAST');
            const reverseRotatedSouth = applyPathRotation(combinedReversePath, 'SOUTH');
            const reverseRotatedWest = applyPathRotation(combinedReversePath, 'WEST');

            // Check if any of the 8 orientations match the canonical path.
            const isPathSimilar = (
                canonicalFormPath === forwardRotatedNorth ||
                canonicalFormPath === forwardRotatedEast ||
                canonicalFormPath === forwardRotatedSouth ||
                canonicalFormPath === forwardRotatedWest ||
                canonicalFormPath === reverseRotatedNorth ||
                canonicalFormPath === reverseRotatedEast ||
                canonicalFormPath === reverseRotatedSouth ||
                canonicalFormPath === reverseRotatedWest
            );

            // If a match is found, output the current path's iteration index.
            if (isPathSimilar) {
                console.log(currentPathIteration);
            }
        }
    }
    // Output a separator string after each complete set of path comparisons.
    console.log("+++++");
}