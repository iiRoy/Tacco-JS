/*
 * This JavaScript file handles standard input processing
 * and then performs a specific grid-based computation.
 *
 * It reads input line by line, processes it, and then
 * outputs the result to the console.
 */
process
    .stdin
    .resume(); // Ensure the standard input stream stays open.


process.stdin.setEncoding(
    'utf8'
); // Set the encoding for incoming data to UTF-8.


var input_string =
    ''; // Initialize an empty string to accumulate all input data.

// This event listener appends each received chunk of data to 'input_string'.
process.stdin.on(
    'data',
    function(
        chunk // 'chunk' represents a portion of the input data.
    ) {
        // Concatenate the new data chunk to the existing input string.
        input_string += chunk;
    }
);


/*
 * Function: space_input
 * Description: Parses a line of space-separated numbers.
 * Parameters:
 *   - line: The input string line to parse.
 * Returns: An array of numbers.
 */
const space_input = function(
    line // The input line string to be processed.
) {
    // Remove leading/trailing whitespace, then split the string by spaces.
    var arr = line.replace(
            /
            (
                ^\s+
            )
            |
            (
                \s+$
            )
            /
            g,
            ""
        )
        .split(
            " "
        );

    // Iterate through the array and convert each string element to a number.
    for (
        var i = 0;
        i < arr.length;
        ++i
    ) {
        arr[i] =
            +arr[i]; // Unary plus operator converts string to number.
    }

    return arr; // Return the array of numbers.
};


/*
 * Function: space_input_char
 * Description: Parses a line of space-separated characters/strings.
 *              (Essentially, it's a clone of space_input but without
 *              the number conversion, which makes it seem redundant
 *              but matches the original structure.)
 * Parameters:
 *   - line: The input string line to parse.
 * Returns: An array of strings.
 */
const space_input_char = function(
    line // The input line string to be processed.
) {
    // Remove leading/trailing whitespace, then split the string by spaces.
    var arr = line.replace(
            /
            (
                ^\s+
            )
            |
            (
                \s+$
            )
            /
            g,
            ""
        )
        .split(
            " "
        );

    // This loop explicitly assigns the element back to itself,
    // effectively doing nothing but maintaining the original structure.
    for (
        var i = 0;
        i < arr.length;
        ++i
    ) {
        arr[i] =
            arr[i]; // No type conversion here, elements remain strings.
    }

    return arr; // Return the array of strings.
};


// This event listener is triggered when all input data has been received.
process.stdin.on(
    'end',
    function() {
        // Split the accumulated input string into an array of lines.
        const lines = input_string.split('\n');

        // Parse the first line to get width (W) and height (H).
        const wh = space_input(lines[0])

        // Extract width from the parsed array.
        const W = wh[0]

        // Extract height from the parsed array.
        const H = wh[1]

        // Process the remaining lines:
        // 1. Slice to remove the first line (W H).
        // 2. Filter out any empty lines.
        // 3. Map each non-empty line into an array of characters.
        const t = lines.slice(1)
            .filter(
                v => v.length > 0
            )
            .map(
                l => l.split("")
            )

        // Initialize an empty array for results (though 'res' is not used later).
        let res = []

        // Initialize an array to store relative coordinates for neighbors (mawari = surroundings).
        let mawari = []

        // Populate 'mawari' with all 8 possible relative neighbor positions (excluding self [0,0]).
        for (
            let i = -1;
            i <= 1;
            ++i
        ) {
            for (
                let j = -1;
                j <= 1;
                ++j
            ) {
                // If it's not the center (0,0), add it to 'mawari'.
                if (
                    i != 0 || j != 0
                ) {
                    mawari.push([
                        i,
                        j
                    ])
                }
            }
        }

        // The console.log(mawari) line was commented out in the original,
        // so it remains commented here.
        //console.log(mawari)

        // Iterate through each cell of the grid (height-wise).
        for (
            let h = 0;
            h < H;
            ++h
        ) {
            // Iterate through each cell of the grid (width-wise).
            for (
                let w = 0;
                w < W;
                ++w
            ) {
                // If the current cell is a '.' (empty space),
                // calculate the number of '#' (obstacles) around it.
                if (
                    t[h][w] === "."
                ) {
                    let cnt = 0 // Initialize counter for surrounding obstacles.

                    // Iterate through each relative neighbor position.
                    for (
                        let m of mawari
                    ) {
                        // The console.log(h+m[0]) line was commented out,
                        // so it remains commented.
                        //console.log(h+m[0])

                        // Check if the neighbor's coordinates are within the grid boundaries.
                        if (
                            (
                                h + m[0]
                            ) < H && // Check if neighbor's row is within bounds (less than H).
                            0 <= h + m[0] && // Check if neighbor's row is within bounds (greater than or equal to 0).
                            (
                                (
                                    w + m[1]
                                ) < W
                            ) && // Check if neighbor's column is within bounds (less than W).
                            0 <= w + m[1] // Check if neighbor's column is within bounds (greater than or equal to 0).
                        ) {
                            // If the neighbor is within bounds and is an obstacle '#', increment the counter.
                            if (
                                t[h + m[0]][w + m[1]] === "#"
                            ) {
                                cnt++
                            }
                        }
                    }
                    // Replace the '.' with the count of surrounding obstacles.
                    t[h][w] = cnt
                }
            }
            // After processing each row, join its characters back into a string and print it.
            console.log(t[h].join(""))
        }
    }

); // End of 'end' event listener.