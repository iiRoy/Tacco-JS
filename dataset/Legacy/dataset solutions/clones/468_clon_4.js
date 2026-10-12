const fileSystem = require('fs');

const spinMatrix = (grid) => {
    const dimension = grid.length;
    return Array.from({ length: dimension }, (_, rowIndex) =>
        Array.from({ length: dimension }, (_, colIndex) => grid[dimension - 1 - colIndex][rowIndex])
    );
};

const verifyPatternMatch = (offsetRow, offsetCol, patternGrid, targetGrid, patternDimension) => {
    let initialMatchPoint = null;

    const allCellsConform = patternGrid.every((pRow, r) =>
        pRow.every((pVal, c) => {
            if (pVal === -1) return true; // Wildcard, always matches

            // Capture the first non-wildcard coordinate if not already set
            if (initialMatchPoint === null) {
                initialMatchPoint = [offsetRow + r, offsetCol + c];
            }

            // Check for value mismatch
            return targetGrid[offsetRow + r][offsetCol + c] === pVal;
        })
    );

    return allCellsConform ? initialMatchPoint : false;
};

const rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');
const inputLines = rawData.trim().split("\n");

while (true) {
    const dimensions = inputLines.shift().split(" ").map(Number);
    const targetRows = dimensions[0];
    const patternDimension = dimensions[1];

    if (targetRows === 0 && patternDimension === 0) break;

    const targetMatrix = Array.from({ length: targetRows }, () =>
        inputLines.shift().split(" ").map(Number)
    );

    let patternMatrix = Array.from({ length: patternDimension }, () =>
        inputLines.shift().split(" ").map(Number)
    );

    let finalMinCoordinates = [101, 101]; // Sentinel value for "not found" or larger coordinates

    // Generate all four rotations of the pattern matrix
    const allPatternRotations = Array.from({ length: 4 }, (_, rotationIdx) => {
        const currentRotation = patternMatrix;
        patternMatrix = spinMatrix(patternMatrix); // Prepare for next rotation
        return currentRotation;
    });

    // Generate all possible top-left offsets for placing the pattern
    const possibleOffsets = Array.from({ length: targetRows - patternDimension + 1 }, (_, rOffset) =>
        Array.from({ length: targetRows - patternDimension + 1 }, (_, cOffset) => [rOffset, cOffset])
    ).flat();

    // Find all matching instances across all rotations and offsets
    const allValidMatches = allPatternRotations.flatMap(rotatedPattern =>
        possibleOffsets.map(([rOffset, cOffset]) =>
            verifyPatternMatch(rOffset, cOffset, rotatedPattern, targetMatrix, patternDimension)
        ).filter(Boolean) // Filter out 'false' results (non-matches)
    );

    // Reduce the list of valid matches to find the lexicographically smallest 1-based coordinate
    finalMinCoordinates = allValidMatches.reduce((currentMin, matchCoord) => {
        const [matchR, matchC] = matchCoord;
        const [minR, minC] = currentMin;

        // Convert to 1-based for comparison
        const oneBasedMatchR = matchR + 1;
        const oneBasedMatchC = matchC + 1;

        if (oneBasedMatchR < minR) {
            return [oneBasedMatchR, oneBasedMatchC];
        }
        if (oneBasedMatchR === minR && oneBasedMatchC < minC) {
            return [oneBasedMatchR, oneBasedMatchC];
        }
        return currentMin;
    }, finalMinCoordinates); // Start reduction with the initial sentinel

    // Output the result
    console.log((finalMinCoordinates.join("") === "101101") ? "NA" : `${finalMinCoordinates[1]} ${finalMinCoordinates[0]}`);
}
