// Helper function to convert a character color 'B' or 'W' to a numeric representation (0 or 1).
// This abstraction makes the main logic cleaner and more focused on numerical operations.
const convertColorCharToNumeric = (colorCharValue) => {
    // 'B' (Black) is conventionally assigned 0, 'W' (White) to 1.
    // This assignment is crucial for the XOR-based color flipping logic.
    if (colorCharValue === "B") {
        return 0;
    } else if (colorCharValue === "W") {
        return 1;
    }
    // In a competitive programming context, input is usually guaranteed valid.
    // For robust applications, one might throw an error or return a default.
    return -1; // Indicate an unexpected color character.
};

// This utility function computes the expected color for a given point (queryX, queryY)
// within a checkerboard grid. The grid's properties are defined by an anchor point
// (anchorX, anchorY), its initial color (initialPatternColor), and the size of each tile (tileDimension).
const determineTilePatternColor = (anchorX, anchorY, initialPatternColor, tileDimension, queryX, queryY) => {
    // The starting color for the queried tile is assumed to be the anchor's color.
    let computedTileColor = initialPatternColor;

    // Calculate the displacement of the query point relative to the checkerboard's anchor.
    const displacementX = queryX - anchorX;
    const displacementY = queryY - anchorY;

    // Determine the grid cell indices (row/column numbers) for the query point
    // relative to the anchor point, using integer division.
    const horizontalCellOffset = Math.floor(displacementX / tileDimension);
    const verticalCellOffset = Math.floor(displacementY / tileDimension);

    // In a checkerboard pattern, the color flips if the relative cell index
    // (either horizontal or vertical) is an odd number.
    // The XOR operation (^) with 1 effectively toggles the color (0 becomes 1, 1 becomes 0).
    if (horizontalCellOffset % 2 !== 0) {
        computedTileColor ^= 1; // Flip color if horizontal offset is odd
    }
    if (verticalCellOffset % 2 !== 0) {
        computedTileColor ^= 1; // Flip color if vertical offset is odd
    }

    // Return the final calculated color for the target point based on the pattern.
    return computedTileColor;
};

// The main entry point for processing the problem's input and calculating the result.
function processInputData(rawDataString) {
    // Split the entire raw input string into an array of individual lines.
    const allInputLines = rawDataString.split("\n");

    // Parse the first line which contains global parameters:
    // total number of points and the dimension (side length) of each grid cell.
    const headerLineTokens = allInputLines[0].split(" ");
    const numberOfPoints = parseInt(headerLineTokens[0], 10);
    const gridCellDimension = parseInt(headerLineTokens[1], 10);

    // Early exit for trivial cases or invalid input to prevent unnecessary computation.
    if (numberOfPoints === 0 || gridCellDimension === 0) {
        console.log(`0`);
        return;
    }

    // Initialize arrays to hold the parsed coordinates and colors of all input points.
    const allRegisteredXCoords = [];
    const allRegisteredYCoords = [];
    const allRegisteredColors = []; // Stores colors as 0s or 1s

    // Iterate through the input lines starting from the second line (index 1)
    // to parse each individual point's data.
    for (let currentLineIndex = 0; currentLineIndex < numberOfPoints; currentLineIndex++) {
        const pointInfoLine = allInputLines[currentLineIndex + 1];
        // Basic input validation: ensure the line exists before splitting.
        if (!pointInfoLine) {
            // Depending on problem constraints, might log an error or simply break.
            break;
        }
        const pointInfoTokens = pointInfoLine.split(" ");
        allRegisteredXCoords.push(parseInt(pointInfoTokens[0], 10));
        allRegisteredYCoords.push(parseInt(pointInfoTokens[1], 10));
        allRegisteredColors.push(convertColorCharToNumeric(pointInfoTokens[2]));
    }

    // This variable will store the highest number of matching points found across all tested configurations.
    let highestMatchCountFound = 0;

    // The problem requires finding the checkerboard pattern (aligned to a kxk grid)
    // that maximizes the number of points matching their assigned color in that pattern.
    // We achieve this by testing various potential "origins" for the checkerboard pattern.
    // The `c[0]` in the original problem implies the base color for the pattern
    // is always derived from the first input point. Let's make this explicit.
    const referencePatternBaseColor = allRegisteredColors[0];

    // Outer loop: Iterate through each input point.
    // Each input point (allRegisteredXCoords[i], allRegisteredYCoords[i])
    // will serve as a reference to define a range of potential checkerboard origins.
    for (let pointReferenceIndex = 0; pointReferenceIndex < numberOfPoints; pointReferenceIndex++) {

        // Middle loops: Iterate through all possible X and Y offsets within a single grid cell.
        // These offsets, when subtracted from the reference point, define a specific
        // top-left corner (origin) for the current checkerboard pattern being evaluated.
        for (let currentXOffset = 0; currentXOffset < gridCellDimension; currentXOffset++) {
            for (let currentYOffset = 0; currentYOffset < gridCellDimension; currentYOffset++) {

                // Calculate the actual (x,y) coordinates of the top-left corner of the (0,0) cell
                // for the checkerboard pattern currently under consideration.
                const currentPatternOriginX = allRegisteredXCoords[pointReferenceIndex] - currentXOffset;
                const currentPatternOriginY = allRegisteredYCoords[pointReferenceIndex] - currentYOffset;

                // Initialize a counter for the number of points that match the current pattern.
                let matchesForCurrentConfiguration = 0;

                // Inner loop: Evaluate all input points against the current checkerboard pattern.
                for (let evaluatedPointIndex = 0; evaluatedPointIndex < numberOfPoints; evaluatedPointIndex++) {
                    // Determine what color the current input point *should* be
                    // according to the active checkerboard pattern.
                    const expectedColorForPoint = determineTilePatternColor(
                        currentPatternOriginX,
                        currentPatternOriginY,
                        referencePatternBaseColor,
                        gridCellDimension,
                        allRegisteredXCoords[evaluatedPointIndex],
                        allRegisteredYCoords[evaluatedPointIndex]
                    );

                    // Compare the expected color with the actual color provided in the input.
                    if (expectedColorForPoint === allRegisteredColors[evaluatedPointIndex]) {
                        matchesForCurrentConfiguration++;
                    }
                }

                // After checking all points for the current configuration, update the global maximum.
                if (matchesForCurrentConfiguration > highestMatchCountFound) {
                    highestMatchCountFound = matchesForCurrentConfiguration;
                }
            }
        }
    }

    // Output the final result: the maximum number of points that can fit a single checkerboard pattern.
    console.log(`${highestMatchCountFound}`);
}

// Standard boilerplate for competitive programming in Node.js:
// Reads all standard input data at once and passes it to the main processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));