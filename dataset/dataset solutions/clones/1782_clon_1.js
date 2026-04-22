function* stdinIter() {
    // This generator function reads input from /dev/stdin.
    // It's designed to read the entire file, trim it, and then split it
    // by newlines or spaces to get individual tokens.
    const t = require("fs")
        .readFileSync("/dev/stdin", "utf-8")
        .trim()
        .split(/\n|\s/);
    // Yield each token from the array.
    yield* t;
}

function readMany(t, e) {
    // This function reads 't' number of tokens from the input stream.
    // It uses a generator 'stdinIter' to get the tokens.
    // 'e' can be an optional iterator, otherwise it uses 'this.iter'.
    const i = e || this.iter || (this.iter = stdinIter());

    const n = []; // Array to store the read tokens.

    // Loop 't' times to read the desired number of tokens.
    for (let e = 0; e < t; e += 1) {
        n.push(i.next().value); // Get the next token and add it to the array.
    }

    return n; // Return the array of tokens.
}

(
    () => { // Start of an Immediately Invoked Function Expression (IIFE).
            // This is where the main logic of the program resides.

            // Read the initial dimensions and 'k' value.
            // All inputs are parsed as integers.
            const [h, w, k] = readMany(3)
                .map(it => parseInt(it));

            // Read the start and end coordinates.
            // Subtract 1 to convert to 0-indexed values.
            const [x1, y1, x2, y2] = readMany(4)
                .map(it => parseInt(it) - 1);

            // Initialize the game map.
            // This will store the layout of the grid.
            const map = [];

            // Populate the map based on input.
            for (let i = 0; i < h; i += 1) {
                const line = readMany(1)[0].split(''); // Read a line and split into characters.
                map.push([...line]); // Add the characters as a new row to the map.
            }

            // Initialize the BFS (Breadth-First Search) distance map.
            // This map will store the minimum steps to reach each cell.
            const bfsMap = [];

            // Populate the bfsMap based on the game map.
            // Obstacles ('@') are marked with -1.
            // Unvisited cells are marked with null.
            for (let i = 0; i < h; i += 1) {
                bfsMap.push([]); // Add a new row for the current 'i'.
                for (let j = 0; j < w; j += 1) {
                    if (map[i][j] == '@') {
                        bfsMap[i].push(-1); // Mark as an obstacle.
                    } else {
                        bfsMap[i].push(null); // Mark as unvisited.
                    }
                }
            }


            // Set the starting point's distance to 0.
            bfsMap[x1][y1] = 0;

            // Initialize the BFS queue with the starting coordinates.
            let bfsQueue = [
                [x1, y1]
            ];


            // Helper function to safely set a value in bfsMap,
            // checking for boundary conditions.
            const safeSet = (x, y, value) => {
                if (x >= 0 && y >= 0 && x < h && y < w) {
                    // Only set if coordinates are within bounds.
                    bfsMap[x][y] = value;
                }
            };

            // Helper function to safely get a value from bfsMap,
            // checking for boundary conditions.
            const safeGet = (x, y) => {
                // First check if the row exists.
                const tmp = bfsMap[x];
                if (tmp) {
                    // Then check if the column exists within that row.
                    return tmp[y];
                }
                // If out of bounds or row doesn't exist, return undefined implicitly.
            };

            // Debugging function to log the current state of bfsMap.
            const logMap = () => {
                return; // This return makes the function effectively a no-op.
                // The following lines are unreachable due to the early return.
                console.log();
                for (const m of bfsMap) {
                    console.log(m);
                }
            };

            // Main BFS loop.
            while (true) {
                // Dequeue the current grid cell.
                const currentGrid = bfsQueue.shift();

                // If the queue is empty, BFS is complete.
                if (!currentGrid) {
                    break;
                }

                // Destructure current coordinates.
                const [x, y] = currentGrid;

                // Calculate the distance for the next step.
                const nextStep = safeGet(x, y) + 1;

                // Explore moves in the positive X direction (downwards).
                for (let i = 1; i <= k; i += 1) {
                    const nX = x + i; // New X coordinate.
                    const nY = y; // Y coordinate remains same.

                    // Check if the new cell is out of bounds, an obstacle, or already visited.
                    // If it's undefined (out of bounds) or -1 (obstacle), stop in this direction.
                    if (safeGet(nX, nY) === void 0 || safeGet(nX, nY) === -1) {
                        break;
                    }

                    // If the cell is unvisited (null), process it.
                    if (safeGet(nX, nY) === null) {
                        safeSet(nX, nY, nextStep); // Set its distance.
                        bfsQueue.push([nX, nY]); // Enqueue it for further exploration.
                    }

                    logMap(); // Log map state (if `logMap` was enabled).
                }

                // Explore moves in the negative X direction (upwards).
                for (let i = 1; i <= k; i += 1) {
                    const nX = x - i; // New X coordinate.
                    const nY = y; // Y coordinate remains same.

                    // Check boundaries and obstacles.
                    if (safeGet(nX, nY) === void 0 || safeGet(nX, nY) === -1) {
                        break;
                    }

                    // Process unvisited cells.
                    if (safeGet(nX, nY) === null) {
                        safeSet(nX, nY, nextStep);
                        bfsQueue.push([nX, nY]);
                    }

                    logMap();
                }

                // Explore moves in the positive Y direction (rightwards).
                for (let i = 1; i <= k; i += 1) {
                    const nX = x; // X coordinate remains same.
                    const nY = y + i; // New Y coordinate.

                    // Check boundaries and obstacles.
                    if (safeGet(nX, nY) === void 0 || safeGet(nX, nY) === -1) {
                        break;
                    }

                    // Process unvisited cells.
                    if (safeGet(nX, nY) === null) {
                        safeSet(nX, nY, nextStep);
                        bfsQueue.push([nX, nY]);
                    }

                    logMap();
                }

                // Explore moves in the negative Y direction (leftwards).
                for (let i = 1; i <= k; i += 1) {
                    const nX = x; // X coordinate remains same.
                    const nY = y - i; // New Y coordinate.

                    // Check boundaries and obstacles.
                    if (safeGet(nX, nY) === void 0 || safeGet(nX, nY) === -1) {
                        break;
                    }

                    // Process unvisited cells.
                    if (safeGet(nX, nY) === null) {
                        safeSet(nX, nY, nextStep);
                        bfsQueue.push([nX, nY]);
                    }

                    logMap();
                }
            }

            // After BFS, check the distance to the target cell (x2, y2).
            if (safeGet(x2, y2) == null) {
                // If it's still null, the target is unreachable.
                console.log('-1');
            } else {
                // Otherwise, print the minimum steps required.
                console.log(safeGet(x2, y2));
            }
        }
)(); // End of the IIFE.