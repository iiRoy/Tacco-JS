"use strict";

const EMPTY_TILE_SYMBOL = '.';
const OBSTACLE_TILE_SYMBOL = '#';

/**
 * Parses raw input string into a 2D character array representing the grid layout.
 *
 * @param {string[]} lineSegments - An array of strings, where each string is a row of the grid.
 * @returns {string[][]} A 2D array where each inner array is a row of characters.
 */
function parseGridMatrix(lineSegments) {
    // Each line segment (excluding the first one which is dimensions) is a row.
    return lineSegments.map(rowString => rowString.split(''));
}

/**
 * Computes the number of empty tiles that can be illuminated
 * from a given central point in cardinal directions (up, down, left, right).
 * Includes the central point itself.
 *
 * @param {string[][]} gridLayout - The 2D array representing the map.
 * @param {number[]} centralPointCoords - An array [x, y] indicating the column and row of the central point.
 * @returns {number} The total count of illuminated tiles.
 */
function calculateOrthogonalReach(gridLayout, centralPointCoords) {
    const startCol = centralPointCoords[0];
    const startRow = centralPointCoords[1];

    // Initialize count with 1 for the central tile itself.
    let illuminatedTileCount = 1;

    const gridHeight = gridLayout.length;
    const gridWidth = gridLayout[0].length;

    // Evaluate upward path
    for (let currentY = startRow - 1; currentY >= 0; --currentY) {
        if (gridLayout[currentY][startCol] === EMPTY_TILE_SYMBOL) {
            illuminatedTileCount++;
        } else if (gridLayout[currentY][startCol] === OBSTACLE_TILE_SYMBOL) {
            break; // Path blocked by an obstacle
        }
    }

    // Evaluate downward path
    for (let currentY = startRow + 1; currentY < gridHeight; ++currentY) {
        if (gridLayout[currentY][startCol] === EMPTY_TILE_SYMBOL) {
            illuminatedTileCount++;
        } else if (gridLayout[currentY][startCol] === OBSTACLE_TILE_SYMBOL) {
            break; // Path blocked
        }
    }

    // Evaluate leftward path
    for (let currentCol = startCol - 1; currentCol >= 0; --currentCol) {
        if (gridLayout[startRow][currentCol] === EMPTY_TILE_SYMBOL) {
            illuminatedTileCount++;
        } else if (gridLayout[startRow][currentCol] === OBSTACLE_TILE_SYMBOL) {
            break; // Path blocked
        }
    }

    // Evaluate rightward path
    for (let currentCol = startCol + 1; currentCol < gridWidth; ++currentCol) {
        if (gridLayout[startRow][currentCol] === EMPTY_TILE_SYMBOL) {
            illuminatedTileCount++;
        } else if (gridLayout[startRow][currentCol] === OBSTACLE_TILE_SYMBOL) {
            break; // Path blocked
        }
    }

    return illuminatedTileCount;
}

/**
 * Main function to process the grid data and determine the highest number of
 * tiles illuminated by a single lamp placement.
 *
 * @param {string} mapDataString - The raw string input containing grid dimensions and layout.
 */
function ProcessIlluminationAnalysis(mapDataString) {
    // Split the entire input into individual line segments.
    let gridLineSegments = mapDataString.split('\n');

    // The first line typically contains grid dimensions, but it's not directly used
    // for iteration bounds in this logic, so we discard it.
    gridLineSegments.shift();

    // Convert the remaining line segments into a 2D array of characters.
    const illuminationGrid = parseGridMatrix(gridLineSegments);

    // Guard clause: Check for empty or malformed grid after parsing.
    if (!illuminationGrid || illuminationGrid.length === 0 || illuminationGrid[0].length === 0) {
        console.log(0);
        return;
    }

    const totalRows = illuminationGrid.length;
    const totalColumns = illuminationGrid[0].length;

    let peakIlluminationScore = 0; // Tracks the maximum illumination found so far.

    // Iterate through each cell in the grid.
    for (let currentRow = 0; currentRow < totalRows; ++currentRow) {
        for (let currentCol = 0; currentCol < totalColumns; ++currentCol) {
            // Only consider placing a lamp on an empty tile.
            if (illuminationGrid[currentRow][currentCol] === EMPTY_TILE_SYMBOL) {
                // Calculate how many tiles this potential lamp position would illuminate.
                const currentTileCoverage = calculateOrthogonalReach(illuminationGrid, [currentCol, currentRow]);

                // Update the maximum score if the current lamp placement is better.
                peakIlluminationScore = Math.max(peakIlluminationScore, currentTileCoverage);
            }
        }
    }

    // Output the final maximum illumination score.
    console.log(peakIlluminationScore);
}

// Entry point for execution, reading from standard input.
ProcessIlluminationAnalysis(require("fs").readFileSync("/dev/stdin", "utf8"));