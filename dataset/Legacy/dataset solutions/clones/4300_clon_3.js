function solveMinefield(rawInputString) {
    let inputLines = rawInputString.split('\n');

    const getSafeGridChar = (r, c, grid, maxRows, maxCols) => {
        if (r < 0 || r >= maxRows || c < 0 || c >= maxCols) {
            return null;
        }
        return grid[r][c];
    };

    const dimensionParts = inputLines[0].split(' ');
    const gridHeight = parseInt(dimensionParts[0], 10);
    const gridWidth = parseInt(dimensionParts[1], 10);

    let minefieldContentLines = inputLines.slice(1); // Grid content without dimensions line

    const totalDotMatchesInInput = rawInputString.match(/\./g);
    const totalGridCells = gridHeight * gridWidth;

    if (!totalDotMatchesInInput) {
        // Scenario 1: No empty cells anywhere (all bombs or empty input)
        console.log(minefieldContentLines.join('\n') + '\n');
    } else if (totalDotMatchesInInput.length === totalGridCells) {
        // Scenario 2: All cells are empty
        console.log(minefieldContentLines.join('\n').replace(/./g, '0') + '\n');
    } else {
        // Scenario 3: Mixed cells, calculate adjacent bombs
        let processedGrid = minefieldContentLines.map(rowStr => rowStr.split('')); // Convert to 2D char array for mutable processing

        for (let currentRow = 0; currentRow < gridHeight; currentRow++) {
            for (let currentCol = 0; currentCol < gridWidth; currentCol++) {
                if (processedGrid[currentRow][currentCol] !== '.') {
                    continue; // Skip if it's already a bomb
                }

                let currentAdjacentBombCount = 0;
                const neighborRelativeCoordinates = [
                    [-1, 0], [-1, 1], [0, 1], [1, 1],
                    [1, 0], [1, -1], [0, -1], [-1, -1]
                ];

                for (const [deltaRow, deltaCol] of neighborRelativeCoordinates) {
                    const neighborRow = currentRow + deltaRow;
                    const neighborCol = currentCol + deltaCol;
                    const neighborCharacter = getSafeGridChar(neighborRow, neighborCol, processedGrid, gridHeight, gridWidth);

                    if (neighborCharacter === '#') {
                        currentAdjacentBombCount++;
                    }
                }
                processedGrid[currentRow][currentCol] = currentAdjacentBombCount.toString();
            }
        }
        console.log(processedGrid.map(rowArr => rowArr.join('')).join('\n'));
    }
}
//solveMinefield(require("fs").readFileSync("/dev/stdin", "utf8"));
