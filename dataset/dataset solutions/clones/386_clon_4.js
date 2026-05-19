const processInput = require('fs').readFileSync('/dev/stdin', 'utf8');
const numericData = processInput.trim().split("\n").map(Number);

let remainingTestCases = numericData.shift();

while (remainingTestCases--) {
    const currentGridSize = numericData.shift();

    if (currentGridSize === 0) {
        console.log("");
        continue;
    }
    if (currentGridSize === 1) {
        console.log("#");
        continue;
    }
    if (currentGridSize === 2) {
        const twoByTwoPattern = "##\n# ";
        console.log(twoByTwoPattern);
        continue;
    }

    const gridCells = Array.from({ length: currentGridSize }, () =>
        Array.from({ length: currentGridSize }, () => "+")
    );

    const rowDeltas = [-1, 0, 1, 0]; // Corresponds to directions: Up, Right, Down, Left
    const colDeltas = [0, 1, 0, -1];

    let currentRow = currentGridSize - 1;
    let currentCol = 0;
    let currentDirectionIndex = 0; // 0: Up, 1: Right, 2: Down, 3: Left

    let lastMarkedPoint = [];

    while (true) {
        // Check if the current cell is valid and available for marking.
        // This acts as the base case for the spiral segment.
        if (currentRow < 0 || currentCol < 0 || currentRow >= currentGridSize || currentCol >= currentGridSize || gridCells[currentRow][currentCol] !== "+") {
            break; // Terminate if current position is invalid or already visited
        }

        const nextRow = currentRow + rowDeltas[currentDirectionIndex];
        const nextCol = currentCol + colDeltas[currentDirectionIndex];

        if (nextRow < 0 || nextCol < 0 || nextRow >= currentGridSize || nextCol >= currentGridSize) {
            // Hit a boundary, change direction and try again from the same current cell
            currentDirectionIndex = (currentDirectionIndex + 1) % 4;
            continue;
        }

        if (gridCells[nextRow][nextCol] === "#") {
            // Collision with an already marked cell, indicating an inner turn or completion
            gridCells[currentRow][currentCol] = "+"; // Revert the current cell to '+'

            let newStartRow, newStartCol, newStartDirection;

            // Calculate the new starting point and direction for the next spiral segment
            // This logic directly mirrors the original's complex recursive calls in the collision block
            switch (currentDirectionIndex) {
                case 3: // Original direction 'z=3' (Left)
                    newStartRow = nextRow - 1;
                    newStartCol = nextCol + 2;
                    newStartDirection = 0; // New direction 'z=0' (Up)
                    break;
                case 0: // Original direction 'z=0' (Up)
                    newStartRow = nextRow + 2;
                    newStartCol = nextCol + 1;
                    newStartDirection = 1; // New direction 'z=1' (Right)
                    break;
                case 1: // Original direction 'z=1' (Right)
                    newStartRow = nextRow + 1;
                    newStartCol = nextCol - 2;
                    newStartDirection = 2; // New direction 'z=2' (Down)
                    break;
                case 2: // Original direction 'z=2' (Down)
                    newStartRow = nextRow - 2;
                    newStartCol = nextCol - 1;
                    newStartDirection = 3; // New direction 'z=3' (Left)
                    break;
            }

            // Check if the calculated new starting point is valid and available
            if (newStartRow < 0 || newStartCol < 0 || newStartRow >= currentGridSize || newStartCol >= currentGridSize || gridCells[newStartRow][newStartCol] !== "+") {
                break; // No more valid segments can be drawn
            }

            // Update state to start the new segment
            currentRow = newStartRow;
            currentCol = newStartCol;
            currentDirectionIndex = newStartDirection;
            continue; // Proceed to draw from the new point
        }

        // No collision and within bounds, mark the current cell and move forward
        gridCells[currentRow][currentCol] = "#";
        lastMarkedPoint = [currentRow, currentCol]; // Store the last successfully marked point
        currentRow = nextRow;
        currentCol = nextCol;
        // Direction remains unchanged for the next iteration
    }

    // Post-processing: If the grid size is even, revert the very last marked point
    if (currentGridSize % 2 === 0) {
        if (lastMarkedPoint.length > 0) {
            gridCells[lastMarkedPoint[0]][lastMarkedPoint[1]] = "+";
        }
    }

    // Format the grid for output: join rows, remove internal commas, replace '+' with ' '
    console.log(gridCells.map(row => row.join("")).join("\n").replace(/\+/g, " "));
}
