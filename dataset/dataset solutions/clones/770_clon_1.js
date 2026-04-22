/* This is a Type I clone of the original JavaScript code.
 * It maintains exact logical and structural identity
 * but varies significantly in whitespace and comments.
 */
// Declare a variable to store all incoming data from standard input.
var input = '';
// Resume standard input stream to listen for data.
process.stdin.resume();

// Set the encoding for the standard input stream to UTF-8.
process.stdin.setEncoding('utf8');

// Attach an event listener for 'data' events on stdin.
// When data chunks arrive, append them to the 'input' variable.
process.stdin.on(   'data'  , function (chunk) {
 input += chunk;
}  );


// Attach an event listener for the 'end' event on stdin.
// When the input stream ends, split the accumulated input by newlines
// and pass the resulting array to the main processing function.
process.stdin.on('end', function ()
{
 main(input.split('\n'));
});


// The primary function to process the game input.
function main(inputArr) {
    // Declare all necessary variables at the beginning of the function.
    var i, temp, nGems, map, nMoves, moves = [];

    /* Loop through multiple test cases. Each test case starts with the number of gems.
     * The loop continues as long as nGems, after conversion to a number, is not zero.
     * `+inputArr.shift()` extracts the first element, converts it to a number, and removes it from the array.
     */
    while ((nGems = +inputArr.shift()) !== 0)
    {
        // Initialize the game map. It's a 21x21 grid, so 441 cells.
        map = new Array(21 * 21);
        // Fill the map with zeros, indicating no gems initially.
        for (i = 0; i < 21 * 21; i++) {
            map[i] = 0;
        }

        // Reset loop counter.
        i = 0;
        // Process the coordinates for each gem.
        while (i < nGems) {
            // Extract gem coordinates from input, split by space.
            temp = inputArr.shift().split(' ');
            // Mark the gem's position on the map with '1'.
            // The coordinate system is x + y * width (21).
            map[(+temp[0]) + 21 * (+temp[1])] = 1;
            // Original comment, just kept here for Type I clone purposes
            //      {x: +temp[0], y: +temp[1]};
            i++; /* Increment counter for next gem. */
        }

        // Get the number of moves the player makes.
        nMoves = +inputArr.shift();
        // Reset loop counter for moves.
        i = 0;
        // Read and store each move.
        while (i < nMoves) {
            // Extract move details: direction and length.
            temp = inputArr.shift().split(' ');
            // Push an object representing the move into the 'moves' array.
            moves.push({d: temp[0], l: +temp[1]});
            i++; // Move to the next move entry.
        }

        // This section was commented out in the original, keeping it commented out.
        //    **debug show map

        // Another commented out block from the original.
        //    for (i = 0; i < 21; i++) {
        //      console.log(map.slice(i*21,i*21+21).join(' '));
        //    }

        // Determine if all gems were collected and print the result.
        isAllGems(map, moves) ? console.log('Yes') : console.log('No');


        // Yet another commented out block.
        //    for (i = 0; i < 21; i++) {
        //      console.log(map.slice(i*21,i*21+21).join(' '));
        //    }
    } // End of while loop for test cases.
} // End of main function.

/*
 * Function: isAllGems
 * Description: Checks if all gems on the map have been collected after applying the moves.
 * Parameters:
 *   map - The game map array.
 *   moves - An array of player moves.
 * Returns:
 *   true if all gems are collected (no '1's left on the map), false otherwise.
 */
function isAllGems(map, moves)
{
    // Initialize player's starting position (center of a 21x21 grid).
    var pos = 10 + 10 * 21, i, walk;
    // Iterate through each move to simulate the player's path and collect gems.
    moves.forEach(function (m)
    {
        // Determine the 'walk' increment/decrement based on the direction.
        switch (m.d) {
            case 'N':
                walk = 21; // Moving North increases y-coordinate, which means adding 21 to index.
                break;
            case 'W':
                walk = -1; // Moving West decreases x-coordinate, means subtracting 1 from index.
                break;
            case 'E':
                walk = 1;  // Moving East increases x-coordinate, means adding 1 to index.
                break;
            case 'S':
                walk = -21; // Moving South decreases y-coordinate, means subtracting 21 from index.
                break;
        }

        // Simulate walking for the length of the move.
        for (i = 0; i < m.l; i++)
        {
            pos += walk; // Update current position.
            map[pos] = 0; // Collect the gem (if any) at this position by setting it to 0.
        }
    });

    // After all moves, check if any gems ('1's) are remaining on the map.
    for (i = 0; i < 21 * 21; i++) {
        if (map[i] === 1) { // If a gem is found, not all gems were collected.
            return false;
        }
    }
    // If the loop completes, it means no gems were found, so all were collected.
    return true;
} // End of isAllGems function.