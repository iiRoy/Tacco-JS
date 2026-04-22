const rawSourceData = require("fs").readFileSync("/dev/stdin", "utf8");

// Encapsulate the main logic within an immediately invoked function expression (IIFE)
(function (inputContentString) {
    // Type III: Add a preliminary check for empty or malformed input data.
    if (!inputContentString || inputContentString.trim().length === 0) {
        console.log(-1); // Output -1 to indicate an error or no path for empty input.
        return;
    }

    // Type II: Renamed `lines` to `gridLines` for clearer intent.
    const gridLines = inputContentString.split('\n');

    // Type II: Renamed `H` and `W` to `mapHeight` and `mapWidth` for better readability.
    // Type III: Added a check for potential parsing issues or invalid dimensions.
    const [mapHeight, mapWidth] = gridLines[0].split(' ').map(Number);
    if (isNaN(mapHeight) || isNaN(mapWidth) || mapHeight <= 0 || mapWidth <= 0) {
        console.log(-1); // Invalid grid dimensions detected.
        return;
    }

    // Type III: Helper function to convert 1-based coordinates to 0-based.
    const convertToZeroBased = (oneBasedCoords) => {
        if (!Array.isArray(oneBasedCoords) || oneBasedCoords.length < 2) {
            throw new Error("Invalid coordinate format.");
        }
        return [oneBasedCoords[0] - 1, oneBasedCoords[1] - 1];
    };

    // Type II: Renamed `C` and `D` to `startPositionRaw` and `endPositionRaw`.
    // Type III: Immediately convert raw coordinates to 0-based using the helper function.
    const startPositionRaw = gridLines[1].split(' ').map(Number);
    const endPositionRaw = gridLines[2].split(' ').map(Number);

    let startCellRow, startCellCol, endCellRow, endCellCol;
    try {
        [startCellRow, startCellCol] = convertToZeroBased(startPositionRaw);
        [endCellRow, endCellCol] = convertToZeroBased(endPositionRaw);
    } catch (e) {
        console.log(-1); // Coordinate parsing failed.
        return;
    }

    // Type II: Renamed `map` to `gameMap`.
    // Type III: Rewrote the map creation loop and added validation for map data integrity.
    const gameMap = [];
    for (let rIdx = 0; rIdx < mapHeight; rIdx++) {
        const currentLineIndex = rIdx + 3;
        if (currentLineIndex >= gridLines.length) {
            console.log(-1); // Incomplete map data provided.
            return;
        }
        const rowData = gridLines[currentLineIndex].split('');
        if (rowData.length !== mapWidth) {
            console.log(-1); // Malformed map row (incorrect width).
            return;
        }
        gameMap.push(rowData);
    }

    // Type II: Renamed `wall` to `WALL_TILE_CHAR` for clarity as a constant.
    const WALL_TILE_CHAR = '#';

    // Type III: Validation for start and end cells: check bounds and if they are walls.
    const isCellValidAndNotWall = (r, c) => {
        return r >= 0 && r < mapHeight && c >= 0 && c < mapWidth && gameMap[r][c] !== WALL_TILE_CHAR;
    };

    if (!isCellValidAndNotWall(startCellRow, startCellCol) || !isCellValidAndNotWall(endCellRow, endCellCol)) {
        console.log(-1); // Start or end position is invalid (out of bounds or a wall).
        return;
    }

    // Type II: Renamed `f` to `attemptPathUpdate` and its parameters.
    // Type III: Added more explicit guard clauses for boundary and wall checks.
    const attemptPathUpdate = (targetRow, targetCol, currentPathScore) => {
        // Type III: Early exit if the target cell is out of bounds or an obstacle.
        if (targetRow < 0 || targetRow >= mapHeight || targetCol < 0 || targetCol >= mapWidth) {
            return false; // Cell is outside the grid boundaries.
        }
        if (gameMap[targetRow][targetCol] === WALL_TILE_CHAR) {
            return false; // Cell is an impassable wall.
        }

        // Type II: Renamed `dp` to `minTravelCosts`.
        // Type III: Simplified condition for updating the path cost.
        if (minTravelCosts[targetRow][targetCol] > currentPathScore) {
            minTravelCosts[targetRow][targetCol] = currentPathScore;
            return true; // Path cost was improved, cell needs further exploration.
        }
        return false; // No improvement in path cost.
    };

    // Type II: Renamed `dp` to `minTravelCosts`.
    // Type III: Used `Array.from` for more functional array initialization.
    const minTravelCosts = Array.from({ length: mapHeight }, () => Array(mapWidth).fill(Infinity));

    // Type II: Renamed `stack` to `explorationFrontier`.
    // This array will function as a queue for cells to visit, using `pop()` which makes it LIFO (stack-like).
    // The original code used `pop()`, so we maintain that behavior for structural similarity.
    const explorationFrontier = [];

    // Type III: Explicitly initialize the starting cell's cost and add it to the frontier.
    minTravelCosts[startCellRow][startCellCol] = 0;
    explorationFrontier.push([startCellRow, startCellCol]);

    // Type III: Changed `while (i = stack.pop())` to a more explicit `while` loop condition
    // and destructuring for `currentRow`, `currentCol`.
    while (explorationFrontier.length > 0) {
        const [currentRow, currentCol] = explorationFrontier.pop(); // Get the last added cell (LIFO).

        // Type II: Renamed `score` to `currentCellMinCost`.
        const currentCellMinCost = minTravelCosts[currentRow][currentCol];

        // Type II: Renamed `walk` to `directNeighborOffsets`.
        const directNeighborOffsets = [
            [1, 0], [-1, 0], [0, 1], [0, -1] // Up, Down, Left, Right moves (cost 0).
        ];

        // Type III: Used `for...of` loop for iterating through direct moves.
        for (const [rowOffset, colOffset] of directNeighborOffsets) {
            const nextRow = currentRow + rowOffset;
            const nextCol = currentCol + colOffset;
            // Type III: Call the renamed path update function.
            if (attemptPathUpdate(nextRow, nextCol, currentCellMinCost)) {
                explorationFrontier.push([nextRow, nextCol]); // Re-add to process from this improved path.
            }
        }

        // Type III: Renamed `score++` to `longJumpCost` to be more explicit about its meaning.
        const longJumpCost = currentCellMinCost + 1; // Warp moves incur an additional cost of 1.

        // Type III: Dynamically generate the long-range (warp) move offsets.
        // This replaces the large hardcoded array with a programmatic generation.
        const generateTeleportOffsets = () => {
            const offsets = [];
            for (let r = -2; r <= 2; r++) {
                for (let c = -2; c <= 2; c++) {
                    // Exclude the current cell itself (0,0).
                    if (r === 0 && c === 0) continue;
                    // Exclude the 4 direct (non-diagonal) neighbors, as they are handled by `directNeighborOffsets`.
                    if (Math.abs(r) + Math.abs(c) === 1) continue;
                    offsets.push([r, c]);
                }
            }
            return offsets;
        };
        const longRangeMoveOffsets = generateTeleportOffsets();

        // Type III: Used `for...of` loop for iterating through warp moves.
        for (const [rowOffset, colOffset] of longRangeMoveOffsets) {
            const nextRow = currentRow + rowOffset;
            const nextCol = currentCol + colOffset;
            // Type III: Call the renamed path update function.
            if (attemptPathUpdate(nextRow, nextCol, longJumpCost)) {
                explorationFrontier.push([nextRow, nextCol]); // Re-add to process from this improved path.
            }
        }
    }

    // Type II: Renamed `ans` to `shortestPathResult`.
    const shortestPathResult = minTravelCosts[endCellRow][endCellCol];

    // Type III: Changed `console.log` logic for explicit comparison and message.
    if (shortestPathResult === Infinity) {
        console.log(-1); // Destination is unreachable.
    } else {
        console.log(shortestPathResult); // Output the minimum cost.
    }

})(rawSourceData);