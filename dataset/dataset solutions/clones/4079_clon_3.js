// Function to process input data and determine the optimal configuration score.
function analyzeGridPoints(rawInputStr) {
    // Ensure the input string is not empty or null.
    if (!rawInputStr || rawInputStr.trim() === '') {
        console.log(0); // No points, no score if input is empty.
        return;
    }

    // Split the entire input string into individual lines.
    const dataLines = rawInputStr.split("\n");

    // Parse the first line to get the number of points and the grid scaling factor.
    // Use array destructuring for cleaner assignment.
    const [numObjects, regionSize] = dataLines[0].split(" ").map(val => parseInt(val, 10));

    // A quick check for valid input values, although competitive programming usually guarantees it.
    // If input is invalid (e.g., non-numeric or negative), return 0.
    if (isNaN(numObjects) || isNaN(regionSize) || numObjects < 0 || regionSize <= 0) {
        console.log(0);
        return;
    }

    // Pre-calculate `2 * K` (doubleRegionSize) as it's used repeatedly for modulo operations.
    const doubleRegionSize = regionSize * 2;

    // Initialize arrays to store the processed data for each point.
    // Pre-allocating array size can sometimes be slightly more efficient than push.
    const horizontalPositions = new Array(numObjects);
    const verticalPositions = new Array(numObjects);
    const objectTypes = new Array(numObjects);

    // Helper function to convert a character color code ('W' or 'B') to a numerical type (0 or 1).
    // This abstracts the color-to-numeric mapping.
    const getTypeFromChar = (char) => (char === "W" ? 0 : 1);

    // Process each point's data from the input lines.
    // We slice the array to iterate only over the lines containing point data (skipping the first line).
    dataLines.slice(1, numObjects + 1).forEach((line, index) => {
        const objectDataTokens = line.split(" ");
        // Parse and store the horizontal position, applying modulo to keep it within the 2K range.
        horizontalPositions[index] = parseInt(objectDataTokens[0], 10) % doubleRegionSize;
        // Parse and store the vertical position, applying modulo.
        verticalPositions[index] = parseInt(objectDataTokens[1], 10) % doubleRegionSize;
        // Convert and store the object's type (color).
        objectTypes[index] = getTypeFromChar(objectDataTokens[2]);
    });

    // Variable to hold the maximum number of matching points found across all configurations.
    let optimalConfigurationScore = 0;

    // Outer loop: Iterate through all possible horizontal offsets (from 0 up to K-1).
    // This simulates shifting the entire grid pattern horizontally.
    for (let currentXOffset = 0; currentXOffset < regionSize; currentXOffset++) {
        // Initialize the count of points currently matching for this specific X-offset.
        let currentMatchCount = 0;

        // Two arrays to efficiently track point contributions for vertical shifts.
        // `alignedPointContributions[j]` counts points that match the pattern AND have Y-coordinate `j`.
        // `misalignedPointContributions[j]` counts points that MISMATCH the pattern AND have Y-coordinate `j`.
        // Using `Array.from` for initialization is another way to create filled arrays.
        const alignedPointContributions = Array.from({length: doubleRegionSize}, () => 0);
        const misalignedPointContributions = Array.from({length: doubleRegionSize}, () => 0);

        // Define a function for the core pattern matching logic.
        // This function determines if a given point's coordinates and type
        // align with the current grid pattern configuration (including the current X-offset).
        const checkPointPatternMatch = (xPos, yPos, pointType) => {
            // Calculate the 'super-cell' coordinates based on `regionSize`.
            // For example, if K=3, x-coordinates 0-2 are in x-block 0, 3-5 in x-block 1, etc.
            const xBlock = Math.floor((xPos + currentXOffset) / regionSize);
            const yBlock = Math.floor(yPos / regionSize);

            // The pattern is a chessboard-like coloring based on the parity of (xBlock XOR yBlock).
            // A block is 'type 0' if (xBlock ^ yBlock) is even, 'type 1' if odd.
            const expectedBlockType = (xBlock ^ yBlock) & 1;
            return expectedBlockType === pointType;
        };

        // First pass: Calculate the initial match count and populate contribution arrays
        // for the current horizontal offset (assuming no vertical shift yet).
        for (let pointIndex = 0; pointIndex < numObjects; pointIndex++) {
            const currentX = horizontalPositions[pointIndex];
            const currentY = verticalPositions[pointIndex];
            const currentType = objectTypes[pointIndex];

            if (checkPointPatternMatch(currentX, currentY, currentType)) {
                currentMatchCount++;
                alignedPointContributions[currentY]++;
            } else {
                misalignedPointContributions[currentY]++;
            }
        }

        // Update the overall maximum score. We consider both `currentMatchCount`
        // and its complement (`numObjects - currentMatchCount`) because the
        // problem often implies finding the maximum of two complementary sets
        // (e.g., maximum 'white' or maximum 'black' points).
        optimalConfigurationScore = Math.max(optimalConfigurationScore, currentMatchCount, numObjects - currentMatchCount);

        // Innermost loop: Simulate vertical shifts of the grid pattern.
        // This utilizes a sliding window or difference array technique for efficiency,
        // avoiding re-calculating `currentMatchCount` from scratch for each vertical shift.
        for (let yShiftIndex = 0; yShiftIndex < regionSize - 1; yShiftIndex++) {
            // When the grid pattern shifts vertically, points whose Y-coordinate modulo `2*K`
            // are `yShiftIndex` or `yShiftIndex + regionSize` effectively switch their
            // 'expected block type' (0 to 1 or 1 to 0). This is because `(y / K)` changes parity.
            //
            // Points that were aligned at `yShiftIndex` now mismatch, and vice versa.
            // The same logic applies to points at `yShiftIndex + regionSize`.
            // The change in `currentMatchCount` is calculated by adding points that become aligned
            // and subtracting points that become misaligned.
            const changeDueToShift = (misalignedPointContributions[yShiftIndex] - alignedPointContributions[yShiftIndex]) +
                                     (misalignedPointContributions[yShiftIndex + regionSize] - alignedPointContributions[yShiftIndex + regionSize]);

            currentMatchCount += changeDueToShift;

            // Update the overall maximum score again after this vertical shift.
            optimalConfigurationScore = Math.max(optimalConfigurationScore, currentMatchCount, numObjects - currentMatchCount);
        }
    }

    // Output the final maximum score.
    console.log(optimalConfigurationScore);
}

// Entry point: Read input from standard input and pass it to the main processing function.
// This is a common pattern for competitive programming environments in Node.js.
analyzeGridPoints(require("fs").readFileSync("/dev/stdin", "utf8"));