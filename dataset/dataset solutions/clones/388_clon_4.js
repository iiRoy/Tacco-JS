function navigateGrid(gridDimension, startRow, startCol, initialDirectionIndex) {
    const gridMatrix = Array.from({ length: gridDimension }, () => Array(gridDimension).fill('+'));
    let lastVisitedCoordinates = [];

    // Direction vectors: [deltaRow, deltaCol] for [Up, Right, Down, Left]
    const movementVectors = [
        [-1, 0], // 0: Up
        [0, 1],  // 1: Right
        [1, 0],  // 2: Down
        [0, -1]  // 3: Left
    ];

    // Stack to manage the traversal state { row, col, direction }
    const traversalPathStack = [{ row: startRow, col: startCol, direction: initialDirectionIndex }];

    while (traversalPathStack.length > 0) {
        const { row, col, direction } = traversalPathStack.pop();

        // If the current cell has already been marked as '#', skip processing this path.
        // This handles the original function's `if(yx[y][x]!="+")return;` guard.
        if (gridMatrix[row][col] === '#') {
            continue;
        }

        const [deltaRow, deltaCol] = movementVectors[direction];
        const nextRow = row + deltaRow;
        const nextCol = col + deltaCol;

        // Check for boundary conditions
        if (nextRow < 0 || nextCol < 0 || nextRow >= gridDimension || nextCol >= gridDimension) {
            const newDirection = (direction + 1) % 4;
            // If out of bounds, try again from the same cell with the next direction.
            traversalPathStack.push({ row, col, direction: newDirection });
        } else {
            // Check for collision with an already marked cell ('#')
            if (gridMatrix[nextRow][nextCol] === '#') {
                // Unmark the current cell (equivalent to yx[Y-dy[z]][X-dx[z]]="+"; which simplifies to yx[y][x]="+";)
                gridMatrix[row][col] = '+';

                let newStartRow, newStartCol, newStartDirection;

                // Determine the new starting point and direction based on the original complex bounce logic
                switch (direction) {
                    case 0: // Moving Up (original z=0)
                        // Original: bomb(Y-2*dy[0], X-2*dx[0]+1, 1)
                        // Translates to: bomb(nextRow + 2, nextCol + 1, 1)
                        newStartRow = nextRow + 2;
                        newStartCol = nextCol + 1;
                        newStartDirection = 1; // Right
                        break;
                    case 1: // Moving Right (original z=1)
                        // Original: bomb(Y-2*dy[1]+1, X-2*dx[1], 2)
                        // Translates to: bomb(nextRow + 1, nextCol - 2, 2)
                        newStartRow = nextRow + 1;
                        newStartCol = nextCol - 2;
                        newStartDirection = 2; // Down
                        break;
                    case 2: // Moving Down (original z=2)
                        // Original: bomb(Y-2*dy[2], X-2*dx[2]-1, 3)
                        // Translates to: bomb(nextRow - 2, nextCol - 1, 3)
                        newStartRow = nextRow - 2;
                        newStartCol = nextCol - 1;
                        newStartDirection = 3; // Left
                        break;
                    case 3: // Moving Left (original z=3)
                        // Original: bomb(Y-2*dy[3]-1, X-2*dx[3], 0)
                        // Translates to: bomb(nextRow - 1, nextCol + 2, 0)
                        newStartRow = nextRow - 1;
                        newStartCol = nextCol + 2;
                        newStartDirection = 0; // Up
                        break;
                }
                traversalPathStack.push({ row: newStartRow, col: newStartCol, direction: newStartDirection });

            } else { // Move Forward: next cell is '+'
                // Mark the current cell and update the last visited cell
                gridMatrix[row][col] = '#';
                lastVisitedCoordinates = [row, col];
                // Continue traversal from the next cell in the same direction
                traversalPathStack.push({ row: nextRow, col: nextCol, direction: direction });
            }
        }
    }
    return { gridMatrix, lastVisitedCoordinates };
}

const fileSystem = require('fs');
const inputData = fileSystem.readFileSync('/dev/stdin', 'utf8');
const numericArray = inputData.trim().split("\n").map(Number);

let testCaseCount = numericArray.shift();

while (testCaseCount--) {
    const currentGridSize = numericArray.shift();

    if (currentGridSize === 1) {
        console.log("#");
        continue;
    }

    const { gridMatrix, lastVisitedCoordinates } = navigateGrid(currentGridSize, currentGridSize - 1, 0, 0);

    // Final adjustment based on grid size parity
    if (currentGridSize % 2 === 0) {
        gridMatrix[lastVisitedCoordinates[0]][lastVisitedCoordinates[1]] = '+';
    }

    // Format and print the output grid
    console.log(gridMatrix.map(row => row.join('')).join("\n").replace(/\+/g, " "));
}
