function processInputData(rawData) {
    const sourceLines = rawData.split('\n');

    const [totalItemCount, tileDimensionFactor] = sourceLines[0].split(' ').map(Number);

    const fullGridDimension = tileDimensionFactor * 2;

    const gamePieces = sourceLines.slice(1, 1 + totalItemCount).map(lineSegment => {
        const dataSegments = lineSegment.split(' ');
        const initialXPosition = Number(dataSegments[0]);
        const initialYPosition = Number(dataSegments[1]);
        const targetShade = (dataSegments[2] === 'W' ? 0 : 1); // 0 for 'W', 1 for 'B'

        return {
            adjustedX: initialXPosition % fullGridDimension,
            adjustedY: initialYPosition % fullGridDimension,
            preferredShade: targetShade
        };
    });

    let topScoreFound = 0;

    // Iterate through potential horizontal shifts for the grid pattern
    for (let horizontalPatternShift = 0; horizontalPatternShift < tileDimensionFactor; ++horizontalPatternShift) {
        let currentPatternMatches = 0;
        const rowMatchTallies = new Map();    // Counts pieces matching for a given row (adjustedY)
        const rowMismatchTallies = new Map(); // Counts pieces NOT matching for a given row (adjustedY)

        // Function to determine the shade of a square at a given coordinate
        // based on the tile dimension and the current horizontal pattern shift.
        // Conceptually: (block_x_coordinate + block_y_coordinate) % 2
        const calculateGridSquareShade = (xPosition, yPosition, currentXOffset) => {
            const xBlockIndex = Math.floor((xPosition + currentXOffset) / tileDimensionFactor);
            const yBlockIndex = Math.floor(yPosition / tileDimensionFactor);
            return (xBlockIndex + yBlockIndex) % 2;
        };

        // First pass: Calculate initial matches for the current horizontal shift and no vertical shift
        for (const piece of gamePieces) {
            const actualSquareShade = calculateGridSquareShade(piece.adjustedX, piece.adjustedY, horizontalPatternShift);

            if (actualSquareShade === piece.preferredShade) {
                currentPatternMatches++;
                rowMatchTallies.set(piece.adjustedY, (rowMatchTallies.get(piece.adjustedY) || 0) + 1);
            } else {
                rowMismatchTallies.set(piece.adjustedY, (rowMismatchTallies.get(piece.adjustedY) || 0) + 1);
            }
        }

        // Update the maximum score found, considering both direct matches and their complement
        // (complement represents the score if the entire board's color pattern was inverted)
        topScoreFound = Math.max(topScoreFound, currentPatternMatches, totalItemCount - currentPatternMatches);

        // Second pass: Efficiently update match count for various vertical shifts
        // This leverages the precomputed row tallies
        for (let verticalSliceIndex = 0; verticalSliceIndex < tileDimensionFactor - 1; ++verticalSliceIndex) {
            // When the vertical pattern shifts, pieces in rows `verticalSliceIndex` and
            // `verticalSliceIndex + tileDimensionFactor` effectively flip their match status.
            const changeInMatches =
                (rowMismatchTallies.get(verticalSliceIndex) || 0) - (rowMatchTallies.get(verticalSliceIndex) || 0) +
                (rowMismatchTallies.get(verticalSliceIndex + tileDimensionFactor) || 0) - (rowMatchTallies.get(verticalSliceIndex + tileDimensionFactor) || 0);

            currentPatternMatches += changeInMatches;
            topScoreFound = Math.max(topScoreFound, currentPatternMatches, totalItemCount - currentPatternMatches);
        }
    }

    console.log(topScoreFound);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));