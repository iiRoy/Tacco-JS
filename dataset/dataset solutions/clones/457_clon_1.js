var input = '';
/*
 * This is a JavaScript program designed to solve a pathfinding puzzle on a grid.
 * It processes input from standard input, constructs a map, places blocks,
 * and then determines if a goal location is reachable from a starting point
 * through regions of the same "color" or block ID.
 */
process.stdin.resume(); // Keep the standard input stream open to receive all data.

process.stdin.setEncoding('utf8'); // Set the encoding for the input data to UTF-8.

process.stdin.on('data', function(chunk) {
    // Event listener: This function is called whenever a new piece of data arrives.
    input += chunk; // Append the incoming data chunk to the 'input' string.
});

process.stdin.on('end', function() {
    // Event listener: This function is called when the standard input stream has ended.
    main(input) /* Once all input has been collected, call the main processing function
                    and pass the complete input string to it. */
});


function main(input) {
    // The core logic of the program is contained within this 'main' function.
    var args = input.trim().split('\n'); /* First, trim any leading/trailing whitespace
                                            from the input string. Then, split the
                                            clean string into an array of lines,
                                            where each line represents an argument. */

    var i = 0; // Initialize an index 'i' to keep track of the current line being processed in 'args'.
    while (true) { // Start an infinite loop to process multiple test cases until an end condition is met.
        var map = []; // Declare and initialize an empty array that will represent the 2D game map.
        var wh = splitNum(args[i++]); /* Read the first line for the current test case,
                                         which contains width and height (wh).
                                         'i++' increments the index for the next read. */
        if (isEnd(wh)) {
            // Check if the 'wh' values (width and height) signify the end of input (0 0).
            break; // If it's the end marker, break out of the infinite loop.
        }
        initMap(wh, map); // Initialize the 'map' with the specified width and height, filled with default values.

        var startXY = splitNum(args[i++]); // Read the next line for the starting X and Y coordinates.
        var goalXY = splitNum(args[i++]);  // Read the next line for the goal X and Y coordinates.

        var blockCount = parseInt(args[i++]); /* Read the line that specifies the number of blocks
                                                  to be placed on the map for this test case. */
        for (var j = 0; j < blockCount; j += 1) { // Loop 'blockCount' times to process each block.
            var block = splitNum(args[i++]); // Read the definition of the current block.
            putBlock(map, block); // Place the block onto the 'map'.
        }

        // Determine if the goal is reachable from the start.
        // Coordinates are adjusted from 1-indexed (from input) to 0-indexed (for array access).
        var res = isReachable(map, startXY[0] - 1, startXY[1] - 1, goalXY[0] - 1, goalXY[1] - 1);
        console.log(res ? "OK" : "NO"); // Print "OK" if reachable, "NO" otherwise.
    }
}


function initMap(wh, map) {
    // This function creates a 2D array (map) with dimensions specified by 'wh'.
    for (var x = 0; x < wh[0]; x += 1) { // Iterate for each column (x-coordinate) up to the width.
        var buff = []; // Create a temporary array to hold the current row.
        for (var y = 0; y < wh[1]; y += 1) { // Iterate for each row (y-coordinate) up to the height.
            buff.push(0); // Fill the current cell with a default value of 0.
        }
        map.push(buff); // Add the completed row to the main map array.
    }
}


function putBlock(map, block) {
    // This function places a given 'block' onto the 'map'.
    var isHorizontal = !block[1]; /* 'block[1]' indicates orientation (0 for horizontal, 1 for vertical).
                                      'isHorizontal' will be true if block[1] is 0. */
    var bw = isHorizontal ? 4 : 2; // Determine the block's width based on its orientation.
    var bh = isHorizontal ? 2 : 4; // Determine the block's height based on its orientation.
    var x = block[2] - 1; // Get the 0-indexed starting X-coordinate for placing the block.
    var y = block[3] - 1; // Get the 0-indexed starting Y-coordinate for placing the block.

    for (var mx = x; mx < x + bw; mx += 1) { // Loop through the X-coordinates covered by the block.
        for (var my = y; my < y + bh; my += 1) { // Loop through the Y-coordinates covered by the block.
            map[mx][my] = block[0]; // Assign the block's ID (color) to the corresponding map cell.
        }
    }
}


function isReachable(map, nowX, nowY, goalX, goalY) {
    // This function recursively checks if the 'goalY' is reachable from 'nowY'
    // by moving through adjacent cells of the same 'color' (block ID).
    // It uses a depth-first search (DFS) like approach.

    if (nowX === goalX && nowY === goalY) {
        // Base case: If the current position is the goal position, then it's reachable.
        return true;
    }
    var color = map[nowX][nowY]; // Get the "color" (block ID) of the current cell.
    map[nowX][nowY] = -2; /* Mark the current cell as visited by changing its value to -2.
                             This prevents revisiting the same cell and infinite loops in recursion. */

    var flag = false; // Initialize a flag to track if any path leads to the goal.
    [-1, 0, 1].forEach(function(dx) { // Iterate over possible changes in X-direction (-1, 0, 1).
        [-1, 0, 1].forEach(function(dy) { // Iterate over possible changes in Y-direction (-1, 0, 1).
            if (!dx && !dy) {
                // Skip the case where both dx and dy are 0 (no movement).
                return;
            }
            var cx = nowX + dx, cy = nowY + dy; // Calculate the coordinates of the neighboring cell.
            // Check if the neighbor is within map boundaries and has the same color as the starting cell.
            if (map[cx] && map[cx][cy] === color) {
                flag = flag || isReachable(map, cx, cy, goalX, goalY); /* Recursively call 'isReachable'
                                                                           for the neighbor. If any recursive call
                                                                           returns true, set 'flag' to true. */
            }
        })
    });
    return flag; // Return the final flag indicating whether the goal was reachable.
}


function splitNum(str) {
    // A utility function to parse a string containing space-separated numbers.
    return str.split(' ').map(Number); /* Splits the string by space, then
                                           converts each resulting string part to a number. */
}


function isEnd(arr) {
    // A utility function to check if an array represents the end-of-input marker.
    return arr[0] === 0 && arr[1] === 0; // Returns true if the first two elements are both 0.
}