var idx = 0; // Global index for processing input lines

/**
 * Rotates the coordinates of a polygon by 90 degrees clockwise.
 * This transformation is applied in-place to the provided coordinate arrays.
 *
 * @param {number[]} coordsX - Array of X coordinates for the polygon vertices.
 * @param {number[]} coordsY - Array of Y coordinates for the polygon vertices.
 * @param {number} pointCount - The number of vertices in the polygon.
 */
function rotateShape(coordsX, coordsY, pointCount) {
    // Iterate through each vertex from 1 to pointCount (inclusive)
    for (var iter = 1; iter <= pointCount; iter++) {
        // Store the current X coordinate temporarily
        var currentX = coordsX[iter];
        // Calculate the new Y coordinate: if current Y is 0, it stays 0; otherwise, it's negated.
        var currentY = coordsY[iter] === 0 ? 0 : coordsY[iter] * (-1);
        // Update the X coordinate with the new Y value
        coordsX[iter] = currentY;
        // Update the Y coordinate with the stored original X value
        coordsY[iter] = currentX;
    }
}

/**
 * Processes a single polygon's input data, normalizing its coordinates
 * and applying rotations based on specific conditions.
 *
 * @param {number[][]} allXCoords - Master array to store X coordinates of all polygons.
 * @param {number[][]} allYCoords - Master array to store Y coordinates of all polygons.
 * @param {number} currentPolyIdx - The index of the current polygon being processed.
 * @param {number[]} polyPointCounts - Array to store the number of points for each polygon.
 * @param {string[]} inputLines - The raw input lines from which to parse data.
 */
function processPolygon(allXCoords, allYCoords, currentPolyIdx, polyPointCounts, inputLines) {
    // Parse the number of points for the current polygon from the input
    polyPointCounts[currentPolyIdx] = parseInt(inputLines[idx++], 10);

    // Initialize arrays for the current polygon's coordinates
    allXCoords[currentPolyIdx] = [];
    allYCoords[currentPolyIdx] = [];

    // Loop through each point of the current polygon
    for (var loopCounter = 1; loopCounter <= polyPointCounts[currentPolyIdx]; loopCounter++) {
        // Split the current input line into X and Y string components
        inputLines[idx] = inputLines[idx].split(" ");
        // Parse and store the X coordinate
        allXCoords[currentPolyIdx][loopCounter] = parseInt(inputLines[idx][0], 10);
        // Parse and store the Y coordinate, then increment the global index
        allYCoords[currentPolyIdx][loopCounter] = parseInt(inputLines[idx++][1], 10);

        // For points after the first one, normalize coordinates relative to the first point
        if (loopCounter > 1) {
            allXCoords[currentPolyIdx][loopCounter] -= allXCoords[currentPolyIdx][1];
            allYCoords[currentPolyIdx][loopCounter] -= allYCoords[currentPolyIdx][1];
        }
    }
    // Set the first point's coordinates to (0,0) after normalization
    allXCoords[currentPolyIdx][1] = 0;
    allYCoords[currentPolyIdx][1] = 0;

    // Apply rotations based on the second point's Y coordinate
    if (allYCoords[currentPolyIdx][2] > 0) {
        rotateShape(allXCoords[currentPolyIdx], allYCoords[currentPolyIdx], polyPointCounts[currentPolyIdx]);
    }
    // Apply rotations based on the second point's X coordinate
    if (allXCoords[currentPolyIdx][2] < 0) {
        rotateShape(allXCoords[currentPolyIdx], allYCoords[currentPolyIdx], polyPointCounts[currentPolyIdx]);
    }
    // Apply rotations based on the second point's Y coordinate again
    if (allYCoords[currentPolyIdx][2] < 0) {
        rotateShape(allXCoords[currentPolyIdx], allYCoords[currentPolyIdx], polyPointCounts[currentPolyIdx]);
    }
}

/**
 * Inverts a polygon's shape by reversing the order of its vertices
 * and re-normalizing its coordinates. It then applies rotations.
 *
 * @param {number[]} polyXCoords - Array of X coordinates for the polygon vertices.
 * @param {number[]} polyYCoords - Array of Y coordinates for the polygon vertices.
 * @param {number} polySize - The number of vertices in the polygon.
 */
function invertPolygon(polyXCoords, polyYCoords, polySize) {
    // Create temporary storage for original coordinates
    var tempXStorage = [];
    var tempYStorage = [];

    // Copy original coordinates to temporary storage
    for (var idxCounter = 1; idxCounter <= polySize; idxCounter++) {
        tempXStorage[idxCounter] = polyXCoords[idxCounter];
        tempYStorage[idxCounter] = polyYCoords[idxCounter];
    }

    // Reverse the order of points and re-normalize relative to the new "first" point
    for (var idxCounter = 1; idxCounter <= polySize; idxCounter++) {
        polyXCoords[idxCounter] = tempXStorage[polySize - idxCounter + 1] - tempXStorage[polySize];
        polyYCoords[idxCounter] = tempYStorage[polySize - idxCounter + 1] - tempYStorage[polySize];
    }

    // Apply rotations based on the second point's Y coordinate
    if (polyYCoords[2] > 0) {
        rotateShape(polyXCoords, polyYCoords, polySize);
    }
    // Apply rotations based on the second point's X coordinate
    if (polyXCoords[2] < 0) {
        rotateShape(polyXCoords, polyYCoords, polySize);
    }
    // Apply rotations based on the second point's Y coordinate again
    if (polyYCoords[2] < 0) {
        rotateShape(polyXCoords, polyYCoords, polySize);
    }
}

/**
 * Main function to execute the program. Reads polygon data,
 * processes them, and finds matches for the first polygon.
 *
 * @param {string} programInput - The entire input string containing polygon data.
 */
function executeProgram(programInput) {
    // Split the input string into an array of lines
    programInput = programInput.split("\n");

    // Loop indefinitely until a termination condition is met
    while (true) {
        // Parse the number of polygons for the current test case
        var numPolygons = parseInt(programInput[idx++], 10);
        // If numPolygons is 0, terminate the program
        if (numPolygons === 0) {
            break;
        }

        // Initialize arrays to store polygon sizes and coordinates
        var polygonSizes = [];
        var allPolyX = [];
        var allPolyY = [];

        // Process each polygon from 0 to numPolygons (inclusive, as polygon 0 is the reference)
        for (var outerLoop = 0; outerLoop <= numPolygons; outerLoop++) {
            processPolygon(allPolyX, allPolyY, outerLoop, polygonSizes, programInput);
        }

        // Compare polygon 0 (reference) with all other polygons
        for (var outerLoop = 1; outerLoop <= numPolygons; outerLoop++) {
            // Check if the number of points matches
            if (polygonSizes[0] === polygonSizes[outerLoop]) {
                var matchFound = true; // Assume a match initially
                // Compare each point's coordinates
                for (var innerLoop = 1; innerLoop <= polygonSizes[0]; innerLoop++) {
                    if (allPolyX[0][innerLoop] !== allPolyX[outerLoop][innerLoop] ||
                        allPolyY[0][innerLoop] !== allPolyY[outerLoop][innerLoop]) {
                        matchFound = false; // Mismatch found
                        break; // Exit inner loop
                    }
                }
                // If a direct match is found, print its index
                if (matchFound) {
                    console.log(outerLoop);
                } else {
                    // If no direct match, try inverting the polygon and re-comparing
                    invertPolygon(allPolyX[outerLoop], allPolyY[outerLoop], polygonSizes[outerLoop]);
                    var matchFound = true; // Reset match flag for inverted comparison
                    for (var innerLoop = 1; innerLoop <= polygonSizes[0]; innerLoop++) {
                        if (allPolyX[0][innerLoop] !== allPolyX[outerLoop][innerLoop] ||
                            allPolyY[0][innerLoop] !== allPolyY[outerLoop][innerLoop]) {
                            matchFound = false; // Mismatch found after inversion
                            break; // Exit inner loop
                        }
                    }
                    // If a match is found after inversion, print its index
                    if (matchFound) {
                        console.log(outerLoop);
                    }
                }
            }
        }
        // Print separator after processing each test case
        console.log("+++++");
    }
}

// Read input from standard input and pass it to the main function
executeProgram(require("fs").readFileSync("/dev/stdin", "utf8"));
