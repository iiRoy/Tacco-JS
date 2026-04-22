function main( )
{
    // Declare all necessary variables at the top of the function scope.
    var i = 0,
        j,
        wh,
        startXY,
        goalXY,
        n,
        board;

    // This is an infinite loop that processes multiple test cases.
    // It continues until an end-of-input condition is met.
    for ( ; ; ) {
        // Read the width and height of the board from input.
        // The input line is split by space and each part converted to a Number.
        wh = input[i++].split(' ').map(Number);

        // Check for the termination condition: if both width and height are 0.
        if ( !wh[0] && !wh[1] )
        {
            break; // Exit the loop if termination condition is met.
        }

        // Initialize the game board with the given dimensions.
        board = initBoard(wh[0], wh[1]);

        // Read the starting coordinates for the pathfinding.
        startXY = input[i++].split(' ').map(Number);
        // Read the goal coordinates for the pathfinding.
        goalXY = input[i++].split(' ').map(Number);
        // Read the number of blocks to be placed on the board.
        n = Number(input[i++]);

        // Loop to place 'n' blocks on the board.
        for ( j = 0; j < n; j++ )
        {
            // The putBlock function is called using bind and apply for flexibility.
            // It takes the board and block parameters from the input.
            putBlock.bind(null, board).apply(null, input[i++].split(' ').map(Number));
        }

        // Determine if a path exists from start to goal and print the result.
        // 'OK' if a path is found, 'NG' otherwise.
        console.log(canGoToGoal(board, startXY, goalXY) ? 'OK' : 'NG');
    }
}

/**
 * Initializes a 2D array (board) of specified width and height,
 * filling it with zeros.
 * @param {number} w - The width of the board.
 * @param {number} h - The height of the board.
 * @returns {Array<Array<number>>} The initialized board.
 */
function initBoard(w, h)
{
    var i,
        j,
        board = []; // Declare board as an empty array.

    // Loop through columns to create rows.
    for ( i = 0; i < w; i++ )
    {
        board.push([]); // Add a new empty row.

        // Loop through rows to initialize cells.
        for ( j = 0; j < h; j++ )
        {
            board[i][j] = 0; // Set each cell to 0 (empty).
        }
    }
    return board; // Return the newly created board.
}

/*
 * Places a block of a specific type and orientation onto the game board.
 * The block is defined by its type 'c', orientation 'd', and top-left corner (x, y).
 */
function putBlock(board, c, d, x, y)
{
    var i,
        j,
        // 'b' stores the dimensions of the block based on its orientation 'd'.
        // d=0 corresponds to [4,2], d=1 corresponds to [2,4].
        b = [ [4, 2], [2, 4] ][d];

    // Iterate over the block's width.
    for ( i = 0; i < b[0]; i++ )
    {
        // Iterate over the block's height.
        for ( j = 0; j < b[1]; j++ )
        {
            // Assign the block type 'c' to the corresponding cells on the board.
            // Note: input coordinates are 1-based, so we subtract 1.
            board[x - 1 + i][y - 1 + j] = c;
        }
    }
}

/**
 * Determines if a path exists from the start coordinates to the goal coordinates
 * on the given board, considering only cells of the same type as the starting cell.
 * Uses a Breadth-First Search (BFS)-like approach.
 *
 * @param {Array<Array<number>>} board    - The game board.
 * @param {Array<number>}        startXY  - [x, y] coordinates of the starting point (1-based).
 * @param {Array<number>}        goalXY   - [x, y] coordinates of the goal point (1-based).
 * @returns {boolean} True if a path exists, false otherwise.
 */
function canGoToGoal(board, startXY, goalXY)
{
    var queue = [], // Queue for BFS traversal, stores [x, y, visited_map]
        to = [ // Array defining all 8 possible directions (neighbors).
            [-1, -1], [ 0, -1], [ 1, -1], // Top-left, Top, Top-right
            [-1,  0],           [ 1,  0], // Left, Right
            [-1,  1], [ 0,  1], [ 1,  1]  // Bottom-left, Bottom, Bottom-right
        ],
        // Convert 1-based start coordinates to 0-based array indices.
        sx = startXY[0] - 1,
        sy = startXY[1] - 1,
        // Convert 1-based goal coordinates to 0-based array indices.
        gx = goalXY[0] - 1,
        gy = goalXY[1] - 1,
        xym, // Temporary variable to hold dequeued coordinates and visited map.
        x, // Current x-coordinate.
        y, // Current y-coordinate.
        m = {}, // Visited map to keep track of visited cells.
        c = board[sx][sy]; // The 'color' or type of the starting block.

    // If the starting cell is empty (0), no path can exist.
    if ( c === 0 )
    {
        return false;
    }

    // Initialize the queue with the starting position and an empty visited map.
    // The visited map is implicitly handled by 'm' in this implementation,
    // but the original code had a placeholder for it here.
    queue.push([sx, sy, {}]);

    // Main BFS loop: continue as long as there are elements in the queue.
    for ( ; queue.length >= 1; )
    {
        xym = queue.shift(); // Dequeue the first element.
        x = xym[0];          // Extract current x-coordinate.
        y = xym[1];          // Extract current y-coordinate.

        // Boundary and type check:
        // - x < 0: out of bounds (left)
        // - board.length <= x: out of bounds (right)
        // - c !== board[x][y]: current cell has a different type than the start cell.
        if ( x < 0 || board.length <= x || c !== board[x][y] )
        {
            continue; // Skip this cell if it's invalid.
        }

        // Check if the current cell is the goal.
        if ( x === gx && y === gy )
        {
            return true; // Goal reached, return true.
        }

        // Mark the current cell as visited.
        // Using an array [x,y] as a key in a JS object converts it to a string "x,y".
        m[[x, y]] = true;

        // Explore all 8 neighboring cells.
        for ( i = 0; i < 8; i++ )
        {
            // Check if the neighbor has not been visited yet.
            if ( !m[[x + to[i][0], y + to[i][1]]] )
            {
                // If not visited, add it to the queue for further exploration.
                queue.push([x + to[i][0], y + to[i][1]]);
            }
        }
    }

    // If the loop finishes and the goal was not reached, no path exists.
    return false;
}


// Global variable to store all input received from stdin.
var input = '';

// Resume stdin to start listening for data.
process.stdin.resume();

// Set the encoding for stdin to UTF-8.
process.stdin.setEncoding('utf8');

// Event listener for 'data': appends incoming chunks to the 'input' string.
process.stdin.on('data', function(chunk) {
    input += chunk;
});

// Event listener for 'end': triggered when all input has been received.
process.stdin.on('end', function() {
    // Split the accumulated input string by newlines into an array of lines.
    input = input.split('\n');
    // Call the main function to start processing the input.
    main();
});