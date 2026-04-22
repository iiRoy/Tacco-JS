const parseNumericValue = (textualValue) => {
    if (typeof textualValue !== 'string' || textualValue.trim() === '') {
        return NaN;
    }
    return Number.parseInt(textualValue, 10);
};

/**
 * Determines the type of a "tile" (pixel/block) in a repeating checkerboard pattern.
 * The pattern is defined by a segment length 's' where blocks of s x s size alternate.
 * Specifically, blocks where (floor(x/s) + floor(y/s)) is even are 'BLACK', otherwise 'WHITE'.
 * This is an equivalent re-implementation of the original 'block' function,
 * but using a more general mathematical approach for the checkerboard pattern.
 *
 * @param {number} segmentLength The size of one side of the elementary square block.
 * @param {number} xCoord The x-coordinate of the point.
 * @param {number} yCoord The y-coordinate of the point.
 * @returns {string} "BLACK" if the tile at (xCoord, yCoord) is black, otherwise "WHITE".
 */
function determineTileType(segmentLength, xCoord, yCoord) {
    const xBlockIndex = Math.floor(xCoord / segmentLength);
    const yBlockIndex = Math.floor(yCoord / segmentLength);

    if ((xBlockIndex + yBlockIndex) % 2 === 0) {
        return "BLACK";
    } else {
        return "WHITE";
    }
}

/**
 * Processes a list of input data to find the maximum number of points
 * that can align with a "BLACK" tile in a shifted checkerboard grid.
 * This function encapsulates the main logic of the original 'Main' function.
 *
 * @param {string[]} rawInputLines An array of strings, where the first string
 *                                 contains global configuration (N, k) and
 *                                 subsequent strings contain point data (x, y, c).
 */
function analyzeGridAlignment(rawInputLines) {
    const configurationParts = rawInputLines[0].split(" ");
    const totalDataPoints = parseNumericValue(configurationParts[0]);
    const gridBlockSize = parseNumericValue(configurationParts[1]);

    if (isNaN(totalDataPoints) || isNaN(gridBlockSize) || totalDataPoints < 0 || gridBlockSize <= 0) {
        console.error("Invalid grid configuration: totalDataPoints or gridBlockSize is invalid.");
        return;
    }

    const adjustedPointCoordinates = [];

    for (let pointIdx = 1; pointIdx <= totalDataPoints; ++pointIdx) {
        const currentPointRecord = rawInputLines[pointIdx].split(" ");
        const originalX = parseNumericValue(currentPointRecord[0]);
        const originalY = parseNumericValue(currentPointRecord[1]);
        const initialPointColor = currentPointRecord[2];

        const xRemainder = originalX % gridBlockSize;
        const yRemainder = originalY % gridBlockSize;

        const xBlockDiv = Math.floor(originalX / gridBlockSize);
        const yBlockDiv = Math.floor(originalY / gridBlockSize);
        const blockParitySum = (xBlockDiv % 2) + (yBlockDiv % 2);

        let effectivePointColor = initialPointColor;

        if (blockParitySum % 2 !== 0) {
            effectivePointColor = (initialPointColor === "B") ? "W" : "B";
        }

        const finalTransformedX = (effectivePointColor === "W") ? (xRemainder + gridBlockSize) : xRemainder;
        const finalTransformedY = yRemainder;

        adjustedPointCoordinates.push([finalTransformedX, finalTransformedY]);
    }

    let highestMatchCount = 0;

    for (let currentShiftRow = 0; currentShiftRow < 2 * gridBlockSize; ++currentShiftRow) {
        for (let currentShiftCol = 0; currentShiftCol < gridBlockSize; ++currentShiftCol) {

            let currentOverlapCount = 0;

            for (const [pointTransformedX, pointTransformedY] of adjustedPointCoordinates) {
                const absoluteGridX = currentShiftCol + pointTransformedX;
                const absoluteGridY = currentShiftRow + pointTransformedY;

                if ("BLACK" === determineTileType(gridBlockSize, absoluteGridX, absoluteGridY)) {
                    currentOverlapCount++;
                }
            }

            highestMatchCount = Math.max(highestMatchCount, currentOverlapCount);

            if (highestMatchCount === totalDataPoints) {
                break;
            }
        }
        if (highestMatchCount === totalDataPoints) {
            break;
        }
    }

    console.log(highestMatchCount);
}

analyzeGridAlignment(require("fs").readFileSync("/dev/stdin", "utf8").split("\n"));